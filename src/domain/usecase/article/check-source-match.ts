import dedent from 'dedent'
import { UseCaseParams } from '../types'
import { GetChildModel } from './get-child-model'
import { sourceMatchResponseFormat } from '@/domain/usecase/article/types'
import { InvalidDataError } from '@/domain/errors'

type Params = UseCaseParams & {
  getChildModel: GetChildModel
}

export type CheckSourceMatch = (params: {
  title: string
  snippet: string
  subject: string
  plan: string
  userId: string
  model_id: string
}) => Promise<{ match: boolean; capsSpend: number }>

export const buildCheckSourceMatch = ({ adapter, service, getChildModel }: Params): CheckSourceMatch => {
  return async ({ title, snippet, subject, plan, userId, model_id }) => {
    const equality = 30
    const prompt = dedent`
      You are an AI model tasked with evaluating whether the following "resource" (title and snippet) can be used to write an article matching the given "subject" and "plan".

      You will be provided with data in the user's message in the following JSON format:
      {
        "source":{
                   "title": string,   // source title to analyze
                   "snippet": string, // source snippet to analyze
                 } 
        "article":{
                   "subject": string  // article subject
                   "plan": string     // article plan
                  }
      }

      Your task is to rate how likely it is that the "resource" (title and snippet) can be used to write an article that matches the "subject" and "plan", on a scale from 0 to 100, where:
        - 100 means the resource is perfectly suitable for writing the article.
        - 0 means the resource cannot be used to write the article.

      The score should reflect how well the resource (title and snippet) could contribute to an article with the given subject and plan.

      The result should be based solely on the content provided in the resource and the article. Do not take any external factors into account.

      Please output your response in JSON format as follows:
      {
        "score": number // the numeric score from 0 to 100
      }

      Output requirements:
      - ONLY return a pure JSON string.
      - Do not add any other additional text.
    `
    const { model } = await getChildModel({
      model_id,
      userId
    })

    const content = JSON.stringify({
      source: {
        title,
        snippet
      },
      article: {
        subject,
        plan
      }
    })

    const response = await adapter.openrouterGateway.sync({
      endUserId: userId,
      messages: [
        {
          role: 'user',
          content
        }
      ],
      settings: {
        model: model.prefix + model.id,
        system_prompt: prompt
      },
      response_format: sourceMatchResponseFormat
    })
    const messageContent = response.message.content?.trim()

    let score = 0
    if (messageContent) {
      try {
        score = JSON.parse(messageContent).score
        if (isNaN(score)) {
          score = 0
        }
      } catch (error) {
        score = 0
      }
    }
    if (!response.usage) {
      throw new InvalidDataError({
        code: 'UNABLE_TO_CHECK_TITLE_SNIPPET_MATCH'
      })
    }

    const caps = await service.model.getCaps({
      model: model,
      usage: response.usage
    })

    return { match: score >= equality, capsSpend: caps }
  }
}
