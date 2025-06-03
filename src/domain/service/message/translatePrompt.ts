import { Adapter } from '@/adapter'

export type TransalatePrompt = (params: { content: string }) => Promise<string>

export const buildTranslatePrompt = ({ openrouterGateway }: Adapter): TransalatePrompt => {
  return async ({ content }) => {
    const { message: translateResult } = await openrouterGateway.sync({
      settings: {
        model: 'openai/gpt-4o',
        temperature: 0,
        top_p: 1,
        system_prompt: "Don't answer, only translate into English"
      },
      messages: [
        {
          role: 'user',
          content
        }
      ]
    })

    return translateResult.content
  }
}
