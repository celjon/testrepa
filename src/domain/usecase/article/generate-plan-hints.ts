import { map, Observable } from 'rxjs'
import dedent from 'dedent'
import { UseCaseParams } from '../types'
import { languagePrompts } from './prompts'
import { GetChildModel } from './get-child-model'
import { HandleResponseStream } from './handle-response-stream'
import { articlePrompts } from './article-prompts'

type Params = UseCaseParams & {
  getChildModel: GetChildModel
  handleResponseStream: HandleResponseStream
}

export type GeneratePlanHints = (params: {
  userId: string
  locale: string
  generationMode: string
  subject: string
  plan: string
  creativity: number
  model_id: string
  developerKeyId?: string
}) => Promise<{
  responseStream$: Observable<{
    status: 'pending' | 'done'
    hints: string[]
    spentCaps: number | null
    caps: bigint | null
  }>
  closeStream: () => void
}>

export const buildGeneratePlanHints = ({
  getChildModel,
  handleResponseStream,
}: Params): GeneratePlanHints => {
  return async ({
    userId,
    locale,
    generationMode,
    subject,
    plan: articlePlan,
    creativity,
    model_id,
    developerKeyId,
  }) => {
    const prompt = dedent`
      You are an AI assistant specialized in generating additional points and ideas for article plans. Your task is to suggest new sections and subsections that would enrich the existing plan while maintaining its structure and style.

      Instructions:
      - Analyze the existing plan structure and content
      - Generate additional points that complement existing sections
      - Suggest new subsections for all sections
      - Ensure each suggestion adds unique value to the plan
      - Use exact numbering to show position (e.g., "2.3" for new third subsection in section 2). Do not use too nested numbering (e.g., "2.3.1") if it is not required by the plan.
      - Generate 8-10 suggestions. Distribute them evenly across all sections including first section.
      - Sort suggestions by their position in the plan, from the beginning to the end.

      Constraints:
      - Do not repeat points that already exist in the plan
      - Keep suggestions concise and specific
      - Maintain logical connection with the main topic
      - Each suggestion must include its numerical position in the plan
      - Do not respond with the full plan

      Your response should contain only:
      - Numbered points indicating position in the plan
      - The suggested text
      - One suggestion per one line
      - No additional formatting or explanations

      Parameters:
      <generationMode>
      ${(articlePrompts[locale] || articlePrompts.ru).generationMode[generationMode] || generationMode}
      </generationMode>
      <subject>${subject}</subject>
      <plan>${articlePlan || 'not provided'}</plan>
      <language>
        The plan must be written in ${languagePrompts[locale] || languagePrompts.ru}.
      </language>
    `

    const { model, subscription, employee } = await getChildModel({
      model_id,
      userId,
    })

    const { responseStream$, closeStream } = await handleResponseStream({
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

    let content = ''
    const stream$ = responseStream$.pipe(
      map((data) => {
        content += data.contentDelta

        const hints = content
          .split('\n')
          .filter((hint) => hint.trim().length > 0 && !articlePlan.includes(hint))

        return {
          status: data.status,
          hints: data.status === 'done' ? hints : hints.slice(0, hints.length - 2),
          spentCaps: data.spentCaps,
          caps: data.caps,
        }
      }),
    )

    return {
      responseStream$: stream$,
      closeStream,
    }
  }
}
