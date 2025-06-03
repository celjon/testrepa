import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

export const searchQueriesSchema = z.object({
  intent: z.string(),
  queries: z.array(
    z.object({
      type: z.union([z.literal('search'), z.literal('website')]),
      query: z.string(),
      numResults: z.number(),
      rationale: z.string()
    })
  )
})

export const searchQueriesResponseFormat = zodResponseFormat(searchQueriesSchema, 'SearchQueries')

export type SearchQueries = z.infer<typeof searchQueriesSchema>['queries']
