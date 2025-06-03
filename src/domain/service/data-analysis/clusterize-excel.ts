import dedent from 'dedent'
import { Adapter, OpenrouterGateway } from '@/domain/types'
import { logger } from '@/lib/logger'
import { ClusterizationResult } from '@/lib/clients/data-analysis-service/types'
import { RawFile } from '@/domain/entity/file'
import { topicNameAndKeywordsResponseFormat, topicNameAndKeywordsSchema } from './types'

export type ClusterizeExcel = (params: {
  userId: string
  excelFile: RawFile
  sheetName?: string
  targetColumns: string[]
}) => Promise<ClusterizationResult>

export const buildClusterizeExcel = ({ dataAnalysisGateway, openrouterGateway }: Adapter): ClusterizeExcel => {
  return async ({ excelFile, sheetName, targetColumns }) => {
    const result = await dataAnalysisGateway.clusterizeExcel({ excelFile, sheetName, targetColumns })

    const enhancedResult: ClusterizationResult = {
      topics: [],
      stats: {
        total_rows: result.stats.total_rows,
        silhouette_score: result.stats.silhouette_score,
        identified_topics: result.stats.identified_topics
      },
      noise: null
    }

    const topics = await Promise.all(
      result.topics.map(async (topic) => {
        const { topicName, keywords } = await generateTopicNameAndKeywords(topic.examples, openrouterGateway)

        return {
          topic_id: topic.topic_id,
          topic_name: topicName,
          keywords: keywords,
          percentage: topic.percentage,
          rows_count: topic.rows_count,
          examples: topic.examples
        }
      })
    )

    enhancedResult.topics = topics

    enhancedResult.noise = result.noise
      ? {
          topic_id: -1,
          percentage: result.noise.percentage,
          rows_count: result.noise.rows_count,
          examples: result.noise.examples
        }
      : null

    return enhancedResult
  }
}

const generateTopicNameAndKeywords = async (
  examples: string[],
  openRouterGateway: OpenrouterGateway
): Promise<{
  topicName: string
  keywords: string[]
}> => {
  const prompt = dedent`
    Проанализируй следующие примеры текста и предложи краткое название темы, которая их объединяет, а также ключевые слова (до 5 шт.).
    Тема должна быть лаконичной (2-4 слова) и отражать основную суть текстов.

    Примеры:
    ${examples.map((example, idx) => `${idx + 1}. ${example}`).join('\n')}

    Отвечай в формате JSON:
    {
      "topicName": string,
      "keywords": string[]
    }
  `

  try {
    const { message } = await openRouterGateway.sync({
      settings: {
        model: 'openai/gpt-4o',
        temperature: 0,
        top_p: 1
      },
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: topicNameAndKeywordsResponseFormat
    })

    const result = topicNameAndKeywordsSchema.parse(JSON.parse(message.content))

    return result
  } catch (error) {
    logger.error('Error generating topic name:', error)
    return {
      topicName: 'UNKNOWN',
      keywords: []
    }
  }
}
