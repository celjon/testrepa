import dedent from 'dedent'
import { UseCaseParams } from '../types'
import { GetChildModel } from './get-child-model'
import { compressSourceResponseFormat } from '@/domain/usecase/article/types'
import { InvalidDataError } from '@/domain/errors'

type Params = UseCaseParams & {
  getChildModel: GetChildModel
}

export type CompressSource = (params: {
  textSource: { title: string; text: string }
  subject: string
  plan: string
  language: string
  userId: string
  model_id: string
}) => Promise<{
  title: string
  text: string
  capsSpendCompressSource: number
}>

export const buildCompressSource = ({
  adapter,
  service,
  getChildModel,
}: Params): CompressSource => {
  return async ({ textSource, subject, language, plan, userId, model_id }) => {
    const { title, text } = textSource
    const prompt = dedent`
     You are an AI assistant tasked with filtering input text, retaining only the information directly relevant to the given subject and article outline.

     You will be provided with data in the user's message in the following JSON format:
     {
        "text": string, // original text to analyze
        "subject": string,    // article subject
        "plan": string        // article plan
     }

     Your task is to:
       1. Analyze the given source text (text) and summarize it aggressively, retaining only the key points and essential details.
       2. Remove all content that does not directly relate to the specified article subject or help in addressing the outlined article plan.
       3. Retain only relevant, factual information that contributes to the article's subject and plan. Focus on key points, findings, facts, examples, and important observations.
       4. Structure your response as a concise summary, organizing the essential content into the following sections:
            - Brief description of the subject and research goal
            - Main methods used in the study or investigation
            - Key results and figures, such as significant statistics or findings
            - Key conclusions drawn from the study
            - Important quotes (if any)
            - Significance and potential applications of the results
       5. Ensure clarity and conciseness, avoiding secondary or irrelevant details while keeping the meaning intact.
       6. Focus on clearly defined, structured content that gives a high-level overview of the article’s core message.

     Your response must strictly follow this format (pure JSON without additional text):
     {
       "filteredText": string // the cleaned text containing only information relevant to the subject and article plan
     }

     Requirements for completing this task:
     - Consider only the provided data (text, subject, and plan).
     - Do not add any external information or additional commentary.
     - Do not include explanations or notes in your response—return only the pure JSON.
      
     Important:
        Language is: ${language}.
    `
    const { model } = await getChildModel({
      model_id,
      userId,
    })
    const content = JSON.stringify({
      text,
      subject,
      plan,
    })
    const response = await adapter.openrouterGateway.sync({
      endUserId: userId,
      messages: [
        {
          role: 'user',
          content,
        },
      ],
      settings: {
        model: model.prefix + model.id,
        system_prompt: prompt,
      },
      response_format: compressSourceResponseFormat,
    })
    const messageContent = response.message.content?.trim()

    let filteredText = ''

    if (messageContent) {
      try {
        const parsed = JSON.parse(messageContent)
        filteredText = parsed.filteredText || ''
      } catch (error) {
        filteredText = ''
      }
    }

    if (!response.usage) {
      throw new InvalidDataError({
        code: 'UNABLE_TO_COMPRESSING_SOURCES',
      })
    }

    const caps = await service.model.getCaps.text({
      model: model,
      usage: response.usage,
    })

    return { title, text: filteredText, capsSpendCompressSource: caps }
  }
}
