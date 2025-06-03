import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

export const topicNameAndKeywordsSchema = z.object({
  topicName: z.string(),
  keywords: z.array(z.string())
})

export const topicNameAndKeywordsResponseFormat = zodResponseFormat(topicNameAndKeywordsSchema, 'TopicNameAndKeywords')
