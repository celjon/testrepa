import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

export type File = {
  size: number
  originalname: string
  buffer: Buffer
}

export const articleStructuredPlanSchema = z.object({
  chapters: z.array(
    z.object({
      chapter: z.string(),
      symbolsCount: z.number(),
      type: z.enum(['general', 'sources']),
    }),
  ),
})

export const articleStructuredPlanResponseFormat = zodResponseFormat(
  articleStructuredPlanSchema,
  'ArticleStructuredPlan',
)
type StructuredPlan = z.infer<typeof articleStructuredPlanSchema>
export type ArticleStructuredChapter = StructuredPlan['chapters'][0]
export type ArticleStructuredPlan = StructuredPlan['chapters']

export const sourceMatchSchema = z.object({
  score: z.number(),
})
export const sourceMatchResponseFormat = zodResponseFormat(sourceMatchSchema, 'TittleSnippetMatch')
export type TittleSnippetMatch = z.infer<typeof sourceMatchSchema>

export const searchQueriesSchema = z.object({ queries: z.array(z.string()) })
export const searchQueriesResponseFormat = zodResponseFormat(searchQueriesSchema, 'SearchQueries')
type Queries = z.infer<typeof searchQueriesSchema>
export type SearchQueries = Queries

export const compressSourceSchema = z.object({
  filteredText: z.string(),
})
export const compressSourceResponseFormat = zodResponseFormat(
  compressSourceSchema,
  'CompressedSource',
)
export type CompressedSource = z.infer<typeof compressSourceSchema>

export const bibliographySchema = z.object({
  bibliographicData: z.object({
    author: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    resourceType: z.string().nullable().optional(),
    responsibility: z.string().nullable().optional(),
    edition: z.string().nullable().optional(),
    publicationPlace: z.string().nullable().optional(),
    publisher: z.string().nullable().optional(),
    publicationYear: z.string().nullable().optional(),
    volumeOrPages: z.string().nullable().optional(),
    series: z.string().nullable().optional(),
    identifier: z.string().nullable().optional(),
    contentType: z.string().nullable().optional(),
  }),
})
export const bibliographyResponseFormat = zodResponseFormat(bibliographySchema, 'Bibliography')
export type Bibliography = z.infer<typeof bibliographySchema>
