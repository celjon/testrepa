import { Adapter } from '@/domain/types'

type Params = Adapter

export type Format = (params: { content: string }) => Promise<string>

export const buildFormat =
  ({ openrouterGateway }: Params): Format =>
  async ({ content }) => {
    const { message } = await openrouterGateway.sync({
      settings: {
        model: 'openai/gpt-4o-mini',
        temperature: 0.7,
      },
      messages: [
        {
          role: 'user',
          content: `
          Read the text role-playing. Don't add anything to the text. Use easy to human read formatting.
          ${content}
          `,
        },
      ],
    })

    return message.content
  }
