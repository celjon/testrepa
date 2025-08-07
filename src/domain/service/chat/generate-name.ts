import { Adapter } from '@/domain/types'

export type GenerateName = (params: {
  user: {
    id: string
  }
  messages: {
    role: string
    content: string | null
    full_content?: string | null
  }[]
}) => Promise<string>

export const buildGenerateName =
  ({ openrouterGateway }: Adapter): GenerateName =>
  async ({ user, messages }) => {
    const { message } = await openrouterGateway.sync({
      settings: {
        model: 'openai/gpt-4o-mini',
        system_prompt: `
          Create a short and clear chat title from the conversation.
          Rules:
          - Maximum 24 characters.
          - Use only letters numbers and spaces.
          - No special characters or punctuation.
          - Must be simple and understandable.
          - Reply in user's language.
          - Examples:
            Good: Logo design help
            Good: Python basics
            Good: Travel tips italy
            Bad: !Help needed!
            Bad: I dont know what to do???
            Bad: Please assist with...
            Bad: Chat name: Example
            Bad: (Chat name)
        `,
        max_tokens: 32,
      },
      messages: messages.map((message) => ({
        role: message.role === 'user' ? 'user' : 'assistant',
        content: message.full_content ?? message.content ?? '',
      })),
      endUserId: user.id,
    })

    return message.content
  }
