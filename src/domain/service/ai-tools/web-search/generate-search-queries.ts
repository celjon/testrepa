import { logger } from '@/lib/logger'
import { getErrorString, leaveJSON } from '@/lib/utils'
import { IModel } from '@/domain/entity/model'
import { Adapter } from '@/domain/types'
import { ModelService } from '@/domain/service/model'
import { SearchQueries, searchQueriesResponseFormat, searchQueriesSchema } from './types'
import { buildSendWithFallback } from './send-with-fallback'

const MAX_TOTAL_RESULTS = 10

type Params = Pick<Adapter, 'openrouterGateway'> & {
  modelService: ModelService
}

export type GenerateSearchQueries = (params: {
  models: IModel[]
  userId: string
  prompt: string
  messages: {
    role: string
    content: string
  }[]
  currentDate: string
  locale: string
}) => Promise<{
  intent: string
  queries: SearchQueries
  caps: number
}>

export const buildGenerateSearchQueries = ({
  openrouterGateway,
  modelService,
}: Params): GenerateSearchQueries => {
  const sendWithFallback = buildSendWithFallback({
    openrouterGateway,
    modelService,
  })

  return async ({ models, userId, prompt, messages, currentDate, locale }) => {
    let queriesString = ''
    try {
      const promptMessage = {
        role: 'user',
        content: prompt,
        full_content: null,
      } as const

      const systemPrompt = `
        You are an expert google search query generator. Generate search queries based on the provided prompt to find relevant information using google search or direct URLs. Maintain original language. 
        You can initiate web searches and open websites and perform web search by returning search queries or URLs. 
        Follow user's instructions carefully to generate valid search queries.

        Requirements:
        - Generate up to 3 targeted queries max or up to 10 websites URLs max.
        - Generate multiple queries if it is impossible to answer the user's question with one query.
        - Total number of results across all queries is up to 10. Try to keep the number of results per query to 8-10. It helps to gather all relevant information.
        - For prompts requesting specific websites, return valid URLs directly, and set the query type to "website".
        - If user's prompt assumes you to deep dive into specific source ("open <website-name>", "investigate content", etc), you should add relevant websites from previous search results to the query. It allows further investigation of the content from the source.
        - In rationale field, provide a brief explanation what kind of information you are looking for.
        - Always fullfill the user's request if users wants to open websites or perform web searches.
        - Return ONLY valid RFC8259 compliant JSON response matching this schema:
        {
          "intent": string,  // required. What user wants to do, why you have generated this query.
          "queries": [{
            "rationale": string,  // required
            "type": "search" | "website",  // required
            "numResults": number,  // required
            "query": string  // required
          }] // required
        }

        Important:
        - Respond ONLY with JSON - no other text.
        - Ensure website URLs are valid and loadable.
        - Try to generate concise and relevant queries, as they will be used to perform web search to gather information and answer the user's prompt using more advanced AI model.
        - Do not just repeat the user's prompt verbatim. Instead, generate useful queries that address the user's question or prompt.
        - Current date is: ${currentDate}.
        - Locale is: ${locale}.
      `

      const result = await sendWithFallback({
        settings: {
          system_prompt: systemPrompt,
        },
        fallbacks: models,
        messages: [
          ...messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          promptMessage,
        ],
        endUserId: userId,
        response_format: searchQueriesResponseFormat,
      })

      queriesString = result.result.message.content
      const queries = searchQueriesSchema.parse(JSON.parse(leaveJSON(queriesString)))

      return {
        intent: queries.intent,
        queries: adjustSearchQueries(queries.queries, MAX_TOTAL_RESULTS),
        caps: result.caps,
      }
    } catch (error) {
      logger.error({
        location: 'aitools.websearch.generateSearchQueries',
        message: `Error generating search query: ${getErrorString(error)}`,
        queriesString,
      })

      throw error
    }
  }
}

export function adjustSearchQueries(queries: SearchQueries, maxTotalResults: number) {
  const seenQueries = new Set<string>()
  queries = queries.filter((query) => {
    const queryKey = `${query.type}:${query.query.toLowerCase().trim()}`
    if (seenQueries.has(queryKey)) {
      return false // Remove duplicate
    }
    seenQueries.add(queryKey)
    query.query = query.query.trim()

    if (query.type === 'website') {
      query.numResults = 1
    }
    if (query.type === 'website' && !URL.canParse(query.query)) {
      query.type = 'search'
    }
    return true
  })
  seenQueries.clear()

  queries.forEach((query) => {
    if (query.type === 'website') {
      query.numResults = 1
    }
    if (query.type === 'website' && !URL.canParse(query.query)) {
      query.type = 'search'
    }
  })

  const searchQueries = queries.filter((q) => q.type === 'search')
  if (searchQueries.length > 3) {
    const excessQueries = searchQueries.slice(3)
    queries = queries.filter((q) => q.type !== 'search' || !excessQueries.includes(q))
    queries.push(...excessQueries.slice(0, 3))
  }

  let totalResults = queries.reduce((sum, q) => sum + q.numResults, 0)

  if (totalResults <= maxTotalResults) {
    return queries
  }

  let currentIndex = queries.length - 1
  let i = 0
  const maxIterations = 1000

  while (totalResults > maxTotalResults && currentIndex >= 0 && i < maxIterations) {
    i++
    const query = queries[currentIndex]

    if (query.type === 'search' && query.numResults > 1) {
      query.numResults--
      totalResults--
    } else {
      currentIndex-- // Move to previous query if can't reduce current one
    }

    // If we reached the start, go back to the end and try again
    if (currentIndex < 0 && totalResults > maxTotalResults) {
      currentIndex = queries.length - 1
    }
  }

  return queries
}
