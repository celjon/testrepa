import dedent from 'dedent'
import { Observable } from 'rxjs'
import { UseCaseParams } from '../types'
import { GetChildModel } from './get-child-model'
import { HandleResponseStream } from './handle-response-stream'
import { articlePrompts } from './article-prompts'

type Params = UseCaseParams & {
  handleResponseStream: HandleResponseStream
  getChildModel: GetChildModel
}

export type AddChapterToPlan = (params: {
  userId: string
  generationMode: string
  subject: string
  plan: string
  locale: string
  creativity: number
  model_id: string
  chapter: string
}) => Promise<{
  responseStream$: Observable<{
    status: 'pending' | 'done'
    contentDelta: string
    spentCaps: number | null
    caps: bigint | null
  }>
  closeStream: () => void
}>

export const buildAddChapterToPlan = ({ handleResponseStream, getChildModel }: Params): AddChapterToPlan => {
  return async ({ userId, model_id, subject, plan, chapter, creativity, locale, generationMode }) => {
    const prompt = dedent`
      You are an AI assistant specialized in integrating new chapters into existing article plans. Your task is to analyze the current plan structure and seamlessly insert a new chapter in the most appropriate location, while adhering to the specified generation mode.

      Instructions:
      - Carefully analyze the existing plan structure, including its numbering system and hierarchy.
      - Evaluate the content and context of the new chapter to be inserted.
      - Consider the generation mode to determine the style and approach for integration.
      - Determine the most logical and appropriate position for the new chapter within the existing plan.
      - Ensure the insertion maintains the overall coherence and flow of the plan.
      - If the new chapter requires sub-chapters, create appropriate placeholders following the existing structure's style.
      Constraints:
      - Preserve the original structure and style of the existing plan as much as possible.
      - Do not alter the content of existing chapters; focus only on inserting the new chapter.
      - Maintain consistent language use throughout the plan.
      - Ensure the numbering system remains consistent after the insertion.
      - Insert the new chapter, adjusting the numbering of subsequent chapters if necessary. 
      - You must adjust the numbering style of the inserted chapter to match the numbering style of the existing plan. Remove numbering if needed. Replace number with "-" if needed.
      - Do not modify existing chapters except their numbering or position.
      - Do not add any explanatory text, tags or comments; provide only the updated plan.

      Parameters:
      <existingPlan>${plan}</existingPlan>
      <newChapter>${chapter}</newChapter>
      <subject>${subject}</subject>
      <generationMode>
      ${(articlePrompts[locale] || articlePrompts.ru).generationMode[generationMode] || generationMode}
      </generationMode>

      Based on these instructions and parameters, please provide the updated plan with the new chapter integrated. Present the entire plan, including the new chapter.
    `

    const { model, subscription, employee } = await getChildModel({
      model_id,
      userId
    })

    return handleResponseStream({
      userId,
      model,
      prompt,
      subscription,
      employee,
      settings: {
        temperature: creativity,
        system_prompt: prompt
      }
    })
  }
}
