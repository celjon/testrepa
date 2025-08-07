import { Observable } from 'rxjs'
import dedent from 'dedent'
import { UseCaseParams } from '../types'
import { languagePrompts } from './prompts'
import { HandleResponseStream } from './handle-response-stream'
import { GetChildModel } from './get-child-model'
import { articlePrompts } from './article-prompts'

type Params = UseCaseParams & {
  handleResponseStream: HandleResponseStream
  getChildModel: GetChildModel
}

export type GeneratePlan = (params: {
  userId: string
  locale: string
  generationMode: string
  subject: string
  creativity: number
  model_id: string
  isAdmin?: boolean
  developerKeyId?: string
}) => Promise<{
  responseStream$: Observable<{
    status: 'pending' | 'done'
    contentDelta: string
    spentCaps: number | null
    caps: bigint | null
  }>
  closeStream: () => void
}>

export const buildGeneratePlan = ({
  handleResponseStream,
  getChildModel,
}: Params): GeneratePlan => {
  return async ({
    userId,
    locale,
    generationMode,
    subject,
    creativity,
    model_id,
    developerKeyId,
  }) => {
    const prompt = dedent`
      You are an expert in creating article plans. Your task is to generate a clear and engaging plan based on the provided subject and generation mode.

      Follow these guidelines:
      <constraints>
      - Create a plan that fits the specified generation mode and subject
      - Use appropriate marking style (numbers, letters, or none) based on the mode
      - Keep the total length under 100 words
      - Write in the specified language
      - Include the subject naturally in the plan
      - Make chapters and sections reflect the main idea clearly
      - Adapt the structure to suit the content type
      - The plan should feel natural and appropriate for the given mode and subject, not like an AI-generated template.
      - Important: Do not copy any example structure - create a unique plan that best serves the specific subject and mode.
      - The plan must be no longer than 100 words. 
      - Do not wrap the plan in quotes. 
      - Do not use any formatting except new lines and spaces. Do not use markdown formatting.
      - Avoid any formatting that could indicate AI-generated text.
      - Do not include hashtags in the plan.
      </constraints>
      <generationMode>
      ${(articlePrompts[locale] || articlePrompts.ru).generationMode[generationMode] || generationMode}
      </generationMode>
      <subject>${subject}</subject>
      <language>
        The plan must be written in ${languagePrompts[locale] || languagePrompts.ru}.
      </language>
    `

    const { model, subscription, employee } = await getChildModel({
      model_id,
      userId,
    })

    return handleResponseStream({
      userId,
      model,
      prompt,
      subscription,
      employee,
      settings: {
        temperature: creativity,
        system_prompt: prompt,
      },
      developerKeyId,
    })
  }
}
