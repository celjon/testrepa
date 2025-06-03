import { LLMPlugin } from '../types'

export type GeneralSystemPromptPlugin = LLMPlugin

export const buildGeneralSystemPromptPlugin = (): GeneralSystemPromptPlugin => {
  return async ({ model }) => {
    const capabilities = model.features
      ?.map((feature) => {
        switch (feature) {
          case 'TEXT_TO_TEXT':
            return 'Automatically transcribe attached audio and video files and answer questions about them.'
          case 'DOCUMENT_TO_TEXT':
            return 'Read attached documents (pdf, docx, xlsx, pptx, txt, etc.) or other files.'
          case 'TEXT_TO_IMAGE':
            return 'Generate images.'
          case 'IMAGE_TO_TEXT':
            return 'See and describe images.'
          default:
            return feature
        }
      })
      .join('\n')

    return {
      caps: 0,
      promptAddition: '',
      systemPromptAddition: `Current date: ${new Date()}\n\nAbout model:\nMade by: ${model.prefix.replace(/.*\/$/, '')}\nYour model name: ${model.id}\nYour capabilities: ${capabilities}\netc.\n\n`
    }
  }
}
