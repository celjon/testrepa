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

export type GenerateSubject = (params: {
  model_id: string
  locale: string
  generationMode: string
  userId: string
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

export const buildGenerateSubject = ({
  handleResponseStream,
  getChildModel,
}: Params): GenerateSubject => {
  return async ({ model_id, locale, generationMode, userId, developerKeyId }) => {
    const prompt = dedent`
      You are a helpful assistant who writes a subject for an article. The subject must be a concise and clear statement that captures the article's main idea. It must be written in a way that is easy to understand and engaging for the reader. 

      No initial ideas are provided, so you must write a subject that is original and not based on any previous ideas. The subject can relate to any part of history, science, technology, art, literature, society, culture, psychology, economics, politics, or any other field of interest. The subject must not always relate to the presence of AI in the world. You are also provided with a generation mode. The generation mode is a string that describes the style of the subject.

      Avoid any formatting that could indicate AI-generated text.
      The subject must be no longer than 100 words. Do not wrap the subject in quotes or tags.

      <generationMode>
      ${generationMode}: 
      ${(articlePrompts[locale] || articlePrompts.ru).generationMode[generationMode] || generationMode}
      Do not include hashtags in the subject. 
      </generationMode>
      <language>
        The subject must be written in ${languagePrompts[locale] || languagePrompts.ru}.
      </language>
      Please use standard capitalization rules: capitalize the first letter of each sentence and use lowercase letters for all other words (except for proper nouns and other words that require capitalization by convention).
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
        temperature: 1,
        system_prompt: prompt,
      },
      developerKeyId,
    })
  }
}
