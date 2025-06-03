import { config } from '@/config'
import { logger } from '@/lib/logger'
import { clamp, getErrorString, withTimeout } from '@/lib'
import { Adapter } from '@/domain/types'
import { NotFoundError } from '@/domain/errors'
import { IModel } from '@/domain/entity/model'
import { ModelService } from '@/domain/service/model'
import { buildSendWithFallback } from './sendWithFallback'
import { buildGenerateSearchQueries } from './generateSearchQueries'
import { ISearchResult } from '@/domain/entity/message'

const CAPS_PER_DOLLAR = 500_000
export const CAPS_PER_1M_CONTENT_TOKENS = 10_000
const SUMMARIZE_THRESHOLD = 5000

const queryGenModelsOrder = ['gemini-2.0-flash-001', 'gpt-4o-mini']

const summarizeModelsOrder = [
  'gemini-2.0-flash-001', // fast, big context length
  'gemini-flash-1.5', // fast, big context length, bad availability
  'nova-micro-v1', // fast, cheap
  'nova-lite-v1',
  'ministral-8b',
  'gpt-4o-mini',
  'deepseek-chat' // small context length
]

type QueryResult = {
  query: string
  numResults: number
  error: string
  results: {
    url: string
    title: string
    snippet: string
    content: string
  }[]
}

export type BuildPerformWebSearchParams = Pick<Adapter, 'openrouterGateway' | 'modelRepository' | 'webSearchGateway'> & {
  modelService: ModelService
}

export type PerformWebSearch = (params: {
  userId: string
  model: IModel
  prompt: string
  messages: {
    role: string
    content: string
  }[]
  locale: string

  onQueriesGenerated?: () => Promise<void>
  onResultsLoaded?: (params: { sources: ISearchResult[] }) => Promise<void>
}) => Promise<{
  promptAddition: string
  systemPromptAddition: string
  caps: number
}>

export const buildPerformWebSearch = ({
  modelRepository,
  openrouterGateway,
  modelService,
  webSearchGateway
}: BuildPerformWebSearchParams): PerformWebSearch => {
  const generateQueries = buildGenerateSearchQueries({
    openrouterGateway,
    modelService
  })

  const sendWithFallback = buildSendWithFallback({
    openrouterGateway,
    modelService
  })

  return async ({ userId, model, prompt, messages, locale, onQueriesGenerated, onResultsLoaded }) => {
    let spentCaps = 0
    const currentDate = new Date().toISOString()

    let [queryModels, summarizeModels] = await Promise.all([
      modelRepository.list({
        where: { id: { in: queryGenModelsOrder } }
      }),
      modelRepository.list({
        where: {
          id: {
            in: summarizeModelsOrder
          }
        }
      })
    ])
    queryModels = sortModels(queryModels, queryGenModelsOrder)
    summarizeModels = sortModels(summarizeModels, summarizeModelsOrder)

    if (!queryModels || summarizeModels.length === 0) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND'
      })
    }

    const { queries, caps, intent } = await generateQueries({
      models: queryModels,
      userId: userId,
      prompt,
      messages: messages.slice(0, -1),
      currentDate,
      locale
    })
    spentCaps += caps

    if (queries.length === 0) {
      return {
        promptAddition:
          "\n\nWeb search was not performed. Web Search Plugin thinks that it is possible to answer the user's question using chat history.",
        systemPromptAddition: getSystemPromptAddition(currentDate),
        caps: spentCaps
      }
    }

    if (onQueriesGenerated) {
      await onQueriesGenerated()
    }

    const queryResults: QueryResult[] = []

    await Promise.all(
      queries.map(async ({ type, query, numResults, rationale }) => {
        const queryResult: QueryResult = {
          query,
          numResults,
          results: [],
          error: ''
        }
        queryResults.push(queryResult)

        try {
          let searchResults: {
            url: string
            title: string | null
            snippet: string | null
            content: string
          }[] = []
          if (type === 'website') {
            const url = query
            const signal = new AbortController()
            const urlContent = await withTimeout(
              webSearchGateway.getMarkdownContent({
                url,
                signal
              }),
              config.timeouts.url_reader
            ).catch((e) => {
              logger.error({
                location: 'aitools.websearch.performWebSearch',
                message: `Failed to load content for ${url}: ${getErrorString(e)}`
              })
              signal.abort()
              return null
            })
            if (!urlContent) {
              return
            }
            spentCaps += CAPS_PER_1M_CONTENT_TOKENS * (urlContent.tokens / 1_000_000)
            searchResults.push({
              url,
              title: urlContent.title ?? '',
              snippet: urlContent.description ?? '',
              content: urlContent.content
            })
          } else {
            const searchStart = performance.now()

            const result = await webSearchGateway.searchWithContents({
              query: `${query} -locale:${locale}`,
              numResults: clamp(numResults, 1, 10)
            })
            searchResults = result.results
            spentCaps += CAPS_PER_DOLLAR * result.costDollars

            logger.debug(`Search with ${clamp(numResults, 1, 10)} results took ${(performance.now() - searchStart).toFixed(2)}ms`)
          }

          await Promise.all(
            searchResults.map(async ({ url, title, snippet, content }): Promise<void> => {
              if (!content) {
                queryResult.results.push({
                  url: url,
                  title: title ?? '',
                  snippet: snippet ?? '',
                  content
                })
                return
              }

              if (content.length <= SUMMARIZE_THRESHOLD) {
                queryResult.results.push({
                  url: url,
                  title: title ?? '',
                  snippet: snippet ?? '',
                  content
                })
                return
              }

              const summarizeStart = performance.now()

              const summarizeSystemPrompt = `
                      Summarize the provided website content focusing strictly on relevance to the user's query and query rationale.
    
                      Context:
                      - Current date: ${currentDate}
                      - Locale: ${locale}
                      - User prompt: ${prompt} 
                      - Search query: ${query}
                      - Query rationale: ${rationale}
                      - User's intent: ${intent}
    
                      Requirements:
                      - Provide summarized content in Russian if the user's prompt is in Russian or contents are in Russian.
                      - Russian language has priority over other languages.
                      - Preserve all **relevant** URLs mentioned in the content.
                      - Focus on information that directly answers user's prompt or query rationale.
                      - Remove all irrelevant content, including navigation links, ads, related content blocks, etc. It is important to keep summarized content short and make it to fit into model context length.
                      - Prioritize information from provided sources over your general knowledge. 
                      - Do not add warnings about information being potentially outdated.
                      - Be concise but comprehensive.
                      - Maintain a neutral tone but highlight critical evaluations from the sources.  
                      - Cite specific facts from the summaries (dates, events, quotes).  
                      - Write detailed responses in clear, well-structured paragraphs.
                      - Do not make up information that is not in the content.
                      - Respond with summarized content only. Do not add any other text like "Here is a summary of the content:".
                    `

              const summarizationResult = await sendWithFallback({
                settings: {
                  system_prompt: summarizeSystemPrompt
                },
                messages: [
                  {
                    role: 'user',
                    content: `WEBSITE CONTENT:\n${content}`
                  } as const
                ],
                endUserId: userId,
                fallbacks: summarizeModels
              }).catch(() => {
                return null
              })

              if (!summarizationResult) {
                queryResult.results.push({
                  url: url,
                  title: title ?? '',
                  snippet: snippet ?? '',
                  content
                })
                return
              }

              logger.debug(`Summarization took ${(performance.now() - summarizeStart).toFixed(2)}ms`)

              spentCaps += summarizationResult.caps
              queryResult.results.push({
                url: url,
                title: title ?? '',
                snippet: snippet ?? '',
                content: summarizationResult.result.message.content
              })
            })
          )
        } catch (e) {
          logger.error({
            location: 'aitools.websearch.performWebSearch',
            message: `Failed to search for query ${query}: ${getErrorString(e)}`
          })

          queryResult.error = `(unable to perform search: ${String(e)})`
        }
      })
    )

    const { formattedResults, sources } = await formatSearchResults({
      modelService,
      model,
      searchResults: queryResults
    })

    if (onResultsLoaded) {
      await onResultsLoaded({ sources })
    }

    return {
      caps: spentCaps,
      sources,
      promptAddition: `\n
            Web Search Plugin was enabled.
            Current date is: ${currentDate}
            <web-search-results>
            ${formattedResults}
            </web-search-results>
          `,
      systemPromptAddition: getSystemPromptAddition(currentDate)
    }
  }
}

// tries to drop some results, so formatted search results can fit into model context.
export const formatSearchResults = async ({
  modelService,
  model,
  searchResults
}: {
  modelService: ModelService
  model: IModel
  searchResults: QueryResult[]
}) => {
  let formattedResults = ''

  const getSources = () => {
    return searchResults.reduce((acc, queryResult) => {
      acc.push(
        ...queryResult.results.map(({ url, title, content }) => ({
          url,
          title,
          snippet: `${content.slice(0, 400).trim()}...`
        }))
      )
      return acc
    }, [] as ISearchResult[])
  }

  while (searchResults.length > 0) {
    formattedResults = searchResults
      .map((queryResult) => {
        const results = queryResult.results
          .map((result) => {
            const content = result.content ? result.content : result.snippet
            return `<website title="${result.title}" url="${result.url}">DESCRIPTION: ${result.snippet}\nCONTENT:\n${content}</website>`
          })
          .join('\n\n')

        return `<query-results>Query: ${queryResult.query}\nResults:\n${queryResult.results.length > 0 ? results : queryResult.error}</query-results>`
      })
      .join('\n\n')

    const tokens = await modelService.tokenize({
      model,
      messages: [
        {
          role: 'user',
          content: formattedResults
        }
      ]
    })

    if (tokens < model.context_length) {
      return { formattedResults, sources: getSources() }
    }

    // Should leave at least one result, otherwise it's not useful
    if (searchResults.length === 1 && searchResults[0].results.length === 1) {
      return { formattedResults, sources: getSources() }
    }

    if (searchResults.length > 0 && searchResults[0].results.length > 0) {
      searchResults[0].results.pop()
    }
    if (searchResults.length > 0 && searchResults[0].results.length === 0) {
      searchResults.pop()
    }
  }

  return {
    formattedResults,
    sources: getSources()
  }
}

export const getSystemPromptAddition = (currentDate: string) => `
  Web Search Plugin allows you to fetch realtime information from the web. It is a powerful tool that can be used to answer questions about the current state of the world, current events, or any other topic that is relevant to the user's interests. The plugin provides a comprehensive and up-to-date source of information that can be used to generate responses to user's questions.
  Requirements:
  - Provide detailed comprehensive response using ONLY facts from search results in tag <web-search-results>.
  - Include ALL relevant URLs as markdown links ([text](url)) when referencing information - these links help users verify and research further.
  - Every fact, claim or statement MUST be supported by links to sources from search results.
  - DO NOT use your general knowledge - rely exclusively on provided search results.
  - Synthesize information from multiple sources when available.
  - Write detailed responses in clear, well-structured paragraphs.
  - Focus on directly answering the user's prompt.
  - Current date is: ${currentDate}.
  Important:
  - You are not allowed to make statements without source links (URLs).
  - Do not make statements grounded on your own knowledge or opinions.
  - You have no right to lie or misinform the user, all actual information from web search results is provided in tag <web-search-results> at the end of the user's prompt.
  - Do not add information that is not specified in the summaries.
  - Do not make assumptions, conclusions, or interpretations that are not supported by data from the sources.
  - Do not use external knowledge or context not mentioned in the input data.
`

export const sortModels = (models: IModel[], order: string[]): IModel[] => {
  const orderMap = new Map<string, number>()
  order.forEach((id, index) => {
    orderMap.set(id, index)
  })

  return models.sort((a, b) => {
    const indexA = orderMap.get(a.id)
    const indexB = orderMap.get(b.id)

    if (indexA === undefined && indexB === undefined) {
      return 0
    }
    if (indexA === undefined) {
      return 1
    }
    if (indexB === undefined) {
      return -1
    }

    return indexA - indexB
  })
}
