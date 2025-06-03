import { AdapterParams } from '@/adapter/types'
import { IMessage } from '@/domain/entity/message'
import { IChatTextSettings } from '@/domain/entity/chatSettings'
import { APIError } from 'openai'
import mime from 'mime-types'
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionChunk,
  ChatCompletionContentPartImage,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionUserMessageParam
} from 'openai/resources'
import { StorageGateway } from '../storage'
import { SendObservable } from '../types'
import { Stream } from 'openai/streaming'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'
import { InvalidDataError, TooManyRequestsError } from '@/domain/errors'
import { isCodex, isO1, isO3 } from '@/domain/entity/model'
import { isOpenrouterError } from './raw'

type ReasoningStream = Stream<
  ChatCompletionChunk & {
    choices: ChatCompletionChunk['choices'][number] &
      {
        delta: { reasoning: string | null }
      }[]
  }
>

type Params = Pick<AdapterParams, 'openRouterBalancer'> & {
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
  provider?: {
    order?: string[]
  }
}) => Promise<SendObservable>

export const buildSend =
  (params: Params): Send =>
  async ({ settings, messages, supportsImages, endUserId, provider }) => {
    const { model } = settings

    try {
      const { client } = params.openRouterBalancer.next()

      const messageImages: Record<string, ChatCompletionContentPartImage[]> = {}

      if (supportsImages) {
        await Promise.all(
          messages.map(async (message) => {
            const images = await Promise.all(
              (message.images || []).map(async (messageImage) => {
                const buffer = await params.storageGateway.read({
                  path: messageImage.original!.path!
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

      const modelWithoutPrefix = model.split('/').slice(1).join('')
      const shouldIncludeFormattingPrompt = isO1({ id: modelWithoutPrefix }) || isO3({ id: modelWithoutPrefix })

      const systemPrompt = settings.full_system_prompt ?? settings.system_prompt ?? ''

      const shouldIncludeSystemPrompt = (!!systemPrompt || shouldIncludeFormattingPrompt) && !modelWithoutPrefix.includes('o1-mini')

      const notSupportsAllSettings = isO1({ id: modelWithoutPrefix }) || isCodex({ id: modelWithoutPrefix })

      const createCompletionParams: ChatCompletionCreateParamsNonStreaming & {
        provider?: {
          order?: string[]
          allow_fallbacks?: boolean
          ignore?: string[]
        }
        include_reasoning: boolean
        reasoning?: {
          effort?: 'low' | 'medium' | 'high'
          exclude?: boolean
        }
      } = {
        model,
        messages: [
          // https://platform.openai.com/docs/guides/reasoning-best-practices#how-to-prompt-reasoning-models-effectively
          ...(shouldIncludeSystemPrompt
            ? [
                {
                  role: 'system' as const,
                  content: shouldIncludeFormattingPrompt
                    ? `Formatting re-enabled. Respond in markdown format. Wrap code within codeblocks. Answer in LaTeX if you using math.\n\n${systemPrompt}`
                    : systemPrompt
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

            const content = message.full_content ?? message.content ?? ''

            return {
              role: 'user',
              content,
              ...(message.images &&
                message.images.length > 0 && {
                  content: [
                    ...(content.trim() === ''
                      ? ([] as const)
                      : ([
                          {
                            type: 'text',
                            text: content
                          }
                        ] as const)),
                    ...images
                  ]
                })
            } satisfies ChatCompletionUserMessageParam
          })
        ],
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
        include_reasoning: true,
        reasoning:
          modelWithoutPrefix === 'claude-3.7-sonnet:thinking'
            ? {
                effort: 'high',
                exclude: false
              }
            : undefined,
        stream_options: {
          include_usage: true
        },

        user: endUserId,
        provider: provider
      }

      const stream = (await client.chat.completions.create({
        ...createCompletionParams,
        transforms: ['middle-out'] as const,
        stream: true,
        stream_options: {
          include_usage: true
        }
      } as ChatCompletionCreateParamsStreaming)) as ReasoningStream

      const openRouter$ = new SendObservable(stream, (subscriber) => {
        ;(async () => {
          try {
            let content: string = ''
            let reasoningContent = ''

            for await (const chunk of stream) {
              let value = chunk.choices?.[0]?.delta?.content ?? null
              let reasoningValue = chunk.choices?.[0]?.delta?.reasoning ?? null

              if (value !== null) {
                content += value
              }
              if (reasoningValue !== null) {
                reasoningContent += reasoningValue
              }

              if (value !== null || reasoningValue !== null) {
                subscriber.next({
                  status: 'pending',
                  value: value ?? '',
                  reasoningValue,
                  usage: null
                })
              }

              if (chunk.usage) {
                subscriber.next({
                  status: 'done',
                  value: content,
                  reasoningValue: reasoningContent,
                  usage: chunk.usage
                })
              }
            }
            subscriber.complete()
          } catch (error) {
            if (isOpenrouterError(error)) {
              if (error.error?.message?.includes("This endpoint's maximum context length")) {
                subscriber.error(
                  new InvalidDataError({
                    code: 'CONTEXT_LENGTH_EXCEEDED',
                    message: error.error?.message ?? error.error.code
                  })
                )
                return
              }

              if (error.error?.message?.includes('Rate limit exceeded: free-models-per-day')) {
                subscriber.error(
                  new TooManyRequestsError({
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: error.error?.message ?? error.error.code
                  })
                )
                return
              }

              if (error.error.code === 429) {
                try {
                  const json = JSON.parse(error.error.metadata.raw ?? '')

                  subscriber.error(
                    new TooManyRequestsError({
                      code: 'RATE_LIMIT_EXCEEDED',
                      message: json.error?.message ?? error.error.message
                    })
                  )
                  return
                } catch (e) {
                  logger.error({
                    location: 'openrouterGateway.sendRawStream',
                    message: getErrorString(e)
                  })
                }
              }
            }

            subscriber.error(error)
          }
        })()

        return () => {
          stream.controller.abort()
        }
      })

      return openRouter$
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message)
      }

      throw error
    }
  }
