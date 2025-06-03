import dedent from 'dedent'
import { UseCaseParams } from '../types'
import { GetChildModel } from './get-child-model'
import { InvalidDataError } from '@/domain/errors'
import { searchQueriesResponseFormat, searchQueriesSchema } from './types'
import { logger } from '@/lib/logger'

type Params = UseCaseParams & {
  getChildModel: GetChildModel
}

export type GenerateSearchQueries = (params: {
  subject: string
  userId: string
  language: string
  model_id: string
}) => Promise<{ queries: string[]; spentCaps: number }>

export const buildGenerateSearchQueries = ({ adapter, service, getChildModel }: Params): GenerateSearchQueries => {
  return async ({ subject, userId, language, model_id }) => {
    const prompt = dedent`
      You are an AI assistant specialized in academic research.

      Given the following research subject, generate exactly three concise and distinct search queries suitable for finding relevant papers on Google Scholar.
      The queries should be formulated in such a way that they are likely to return research or academic papers.
      Make sure the queries do not repeat each other, and avoid using synonyms or overly similar phrases.
      Subject: "${subject}"
      
      Requirements:
        1. Output must be a single valid JSON object with a "queries" field containing an array of three strings, for example: 
          {"queries":["query one","query two","query three"]}
        2. Each query should be short (no more than 6 words) and focused on the core of the subject.
        3. The queries should be distinct and not repeat each other or use synonymous terms.
        4. The queries should be designed to yield results with academic papers or research on the topic.
        5. If the subject is nonsensical or too vague for effective queries, identify its three most important keywords and return them as the queries.
        6. Do not output any additional text—only the JSON object.

      Important:
        Language is: ${language}.
    `

    const { model } = await getChildModel({ model_id, userId })

    const response = await adapter.openrouterGateway.sync({
      endUserId: userId,
      messages: [
        {
          role: 'user',
          content: JSON.stringify({ subject })
        }
      ],
      settings: {
        model: model.prefix + model.id,
        system_prompt: prompt
      },
      response_format: searchQueriesResponseFormat
    })

    const content = response.message.content?.trim() || ''
    let result: { queries: string[] } = { queries: [] }

    try {
      const parsed = JSON.parse(content)
      result = searchQueriesSchema.parse(parsed)
    } catch (error) {
      logger.error('UNABLE_TO_GENERATE_SEARCH_QUERIES', { error, content })
      throw new InvalidDataError({
        code: 'UNABLE_TO_GENERATE_SEARCH_QUERIES'
      })
    }

    if (!response.usage) {
      throw new InvalidDataError({ code: 'UNABLE_TO_GENERATE_SEARCH_QUERIES' })
    }

    const caps = await service.model.getCaps({ model, usage: response.usage })

    return { ...result, spentCaps: caps }
  }
}
