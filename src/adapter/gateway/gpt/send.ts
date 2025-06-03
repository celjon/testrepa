import { AdapterParams } from '@/adapter/types'
import { IMessage } from '@/domain/entity/message'
import { IChatTextSettings } from '@/domain/entity/chatSettings'
import { APIError } from 'openai'
import { ChatCompletionAssistantMessageParam, ChatCompletionContentPartImage, ChatCompletionUserMessageParam } from 'openai/resources'
import mime from 'mime-types'
import { IFile } from '@/domain/entity/file'
import { isCodex, isO1, isO3, isOpenAISearch } from '@/domain/entity/model'
import { StorageGateway } from '../storage'
import { SendObservable } from '../types'
import { InvalidDataError } from '@/domain/errors'

type Params = Pick<AdapterParams, 'openaiBalancer'> & {
  storageGateway: StorageGateway
}

export type Send = (params: {
  messages: Array<IMessage>
  settings: Partial<IChatTextSettings> & {
    model: string
    system_prompt: string
  }
  supportsImages?: boolean
  endUserId: string
}) => Promise<SendObservable>

export const buildSend =
  (params: Params): Send =>
  async ({ settings, messages, supportsImages, endUserId }) => {
    const { model } = settings

    try {
      const { client } = params.openaiBalancer.next()

      const messageImages: Record<string, ChatCompletionContentPartImage[]> = {}

      if (supportsImages) {
        await Promise.all(
          messages.map(async (message) => {
            const images = await Promise.all(
              (message.images || []).map(async (messageImage) => {
                const buffer = await params.storageGateway.read({
                  path: (messageImage.original as IFile).path!
                })

                const base64url = buffer.toString('base64')
                // remove query string and get mime type
                const mimeType = mime.lookup(messageImage.original!.path!.replace(/\?.*$/, ''))

                return {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64url}`
                  }
                } satisfies ChatCompletionContentPartImage
              })
            )

            messageImages[message.id] = images
          })
        )
      }

      const notSupportsAllSettings = isO1({ id: model }) || isO3({ id: model }) || isCodex({ id: model }) || isOpenAISearch({ id: model })

      const stream = await client.chat.completions.create({
        model,
        messages: [
          // https://platform.openai.com/docs/guides/reasoning-best-practices#how-to-prompt-reasoning-models-effectively
          ...(model.includes('o3-mini') || model.includes('o1-preview') || model.includes('o4-mini') || model === 'o1'
            ? [
                {
                  role: 'developer' as const,
                  content: 'Formatting re-enabled'
                }
              ]
            : []),
          ...(!isO1({ id: model })
            ? [
                {
                  role: 'system' as const,
                  content: settings.full_system_prompt ?? settings.system_prompt ?? ''
                }
              ]
            : []),
          ...messages.map((message) => {
            if (message.role === 'assistant') {
              return {
                role: 'assistant',
                content: message.full_content ?? message.content ?? ''
              } satisfies ChatCompletionAssistantMessageParam
            }

            const images = messageImages[message.id] || []

            return {
              role: 'user',
              content: message.full_content ?? message.content ?? '',
              ...(supportsImages &&
                message.images &&
                message.images.length > 0 && {
                  content: [
                    {
                      type: 'text',
                      text: message.full_content ?? message.content ?? ''
                    },
                    ...images
                  ]
                })
            } satisfies ChatCompletionUserMessageParam
          })
        ],
        stream: true,
        ...(notSupportsAllSettings
          ? {
              max_completion_tokens: settings.max_tokens
            }
          : {
              max_tokens: settings.max_tokens,
              temperature: settings.temperature,
              presence_penalty: settings.presence_penalty,
              top_p: settings.top_p,
              frequency_penalty: settings.frequency_penalty
            }),
        stream_options: {
          include_usage: true
        },
        user: endUserId
      })

      const gpt$ = new SendObservable(stream, (subscriber) => {
        ;(async () => {
          try {
            let content: string = ''

            for await (const chunk of stream) {
              const value: string | null = chunk.choices[0]?.delta?.content ?? null

              if (value !== null) {
                content += value
                subscriber.next({
                  status: 'pending',
                  value,
                  reasoningValue: null,
                  usage: null
                })
              }

              if (chunk.usage) {
                subscriber.next({
                  status: 'done',
                  value: content,
                  reasoningValue: null,
                  usage: chunk.usage
                })
              }
            }

            subscriber.complete()
          } catch (error) {
            subscriber.error(error)
          }
        })()

        return () => {
          stream.controller.abort()
        }
      })

      return gpt$
    } catch (error) {
      if (error?.code === 'context_length_exceeded') {
        throw new InvalidDataError({
          code: 'CONTEXT_LENGTH_EXCEEDED',
          message: error.message
        })
      }

      if (error?.code === 'string_above_max_length') {
        throw new InvalidDataError({
          code: 'MESSAGE_TOO_LONG',
          message: error.message
        })
      }

      if (error instanceof APIError) {
        throw new Error(error.message)
      }

      throw error
    }
  }
