import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionUserMessageParam
} from 'openai/resources'
import { APIError } from 'openai'
import { withTimeout } from '@/lib'
import { tokenize } from '@/lib/tokenizer'
import { config as cfg } from '@/config'
import { AdapterParams } from '@/adapter/types'
import { InternalError, InvalidDataError } from '@/domain/errors'
import { IMessage } from '@/domain/entity/message'
import { IChatTextSettings } from '@/domain/entity/chatSettings'
import { SendObservable } from '../types'

type Params = Pick<AdapterParams, 'g4f'>

export type Send = (params: {
  apiUrl: string
  messages: Array<IMessage>
  settings: Partial<IChatTextSettings> & {
    model: string
    system_prompt: string
  }
  endUserId: string
  provider?: string
}) => Promise<SendObservable>

export const buildSend = ({ g4f }: Params): Send => {
  const tokenize = buildTokenizeG4F()

  return async ({ apiUrl, settings, messages, endUserId, provider }) => {
    try {
      if (messages.some((message) => message.role === 'user' && message.images && message.images.length > 0)) {
        throw new InternalError({
          code: 'G4F_VISION_NOT_SUPPORTED',
          message: 'gpt4free vision not supported'
        })
      }

      const { model } = settings

      const g4fClient = g4f.client.create({
        apiUrl,
        harManagerUrl: cfg.model_providers.g4f.har_manager_url
      })

      const createCompletionParams: ChatCompletionCreateParamsNonStreaming & {
        provider?: string
      } = {
        model: model.replaceAll('.', '-'), // must be valid slug
        messages: [
          {
            role: 'system',
            content: `Always use markdown formatting in your responses. Respond on user's language.\n${settings.full_system_prompt ?? settings.system_prompt ?? ''}`
          },
          ...messages.map((message) => {
            if (message.role === 'assistant') {
              return {
                role: 'assistant',
                content: message.full_content ?? message.content ?? ''
              } satisfies ChatCompletionAssistantMessageParam
            }

            return {
              role: 'user',
              content: message.full_content ?? message.content ?? ''
            } satisfies ChatCompletionUserMessageParam
          })
        ],
        temperature: settings.temperature,
        presence_penalty: settings.presence_penalty,
        max_tokens: settings.max_tokens,
        top_p: settings.top_p,
        frequency_penalty: settings.frequency_penalty,
        user: endUserId,
        provider
      }

      const [stream, prompt_tokens] = await Promise.all([
        withTimeout(
          g4fClient.chat.completions.create({
            ...createCompletionParams,
            transforms: [] as const,
            stream_options: {
              include_usage: true
            },
            stream: true
          } as ChatCompletionCreateParamsStreaming),
          cfg.timeouts.g4f_send
        ),
        tokenize({
          modelId: model,
          messages,
          settings: settings
        })
      ])

      const g4f$ = new SendObservable(stream, (subscriber) => {
        ;(async () => {
          try {
            let content: string = ''

            for await (const chunk of stream) {
              const value: string | null = chunk.choices?.[0]?.delta?.content ?? null

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
                const completion_tokens = await tokenize({
                  modelId: model,
                  messages: [
                    {
                      role: 'assistant',
                      content
                    }
                  ]
                })

                subscriber.next({
                  status: 'done',
                  value: content,
                  reasoningValue: null,
                  usage: {
                    completion_tokens,
                    prompt_tokens,
                    total_tokens: prompt_tokens + completion_tokens
                  }
                })
              }
            }

            subscriber.complete()
          } catch (error) {
            if (error.error?.message?.includes('ResponseStatusError: Response 402')) {
              subscriber.error(
                new InternalError({
                  code: 'G4F_PAYMENT_REQUIRED',
                  message: error.error?.message
                })
              )
            } else if (error.error?.message?.includes('ResponseStatusError: Response 403')) {
              subscriber.error(
                new InternalError({
                  code: 'G4F_FORBIDDEN',
                  message: error.error?.message
                })
              )
            } else if (error.error?.message?.includes('ResponseStatusError: Response 413')) {
              subscriber.error(
                new InvalidDataError({
                  code: 'CONTEXT_LENGTH_EXCEEDED',
                  message: error.error?.message
                })
              )
            } else if (error.error?.message?.includes('NoValidHarFileError:')) {
              subscriber.error(
                new InternalError({
                  code: 'G4F_NO_VALID_HAR_FILE',
                  message: error.error?.message
                })
              )
            } else if (error.error?.message?.includes('MissingAuthError')) {
              subscriber.error(
                new InternalError({
                  code: 'G4F_NO_VALID_ACCESS_TOKEN',
                  message: error.error?.message
                })
              )
            } else if (error.error?.message?.includes(`RuntimeError: You've hit your limit. Please try again later.`)) {
              subscriber.error(
                new InternalError({
                  code: 'G4F_MODEL_USAGE_COUNT_EXCEEDED',
                  message: error.error?.message
                })
              )
            }

            subscriber.error(error)
          }
        })()

        return () => {
          stream.controller.abort()
        }
      })

      return g4f$
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.message)
      }

      throw error
    }
  }
}

type Tokenize = (params: {
  modelId: string
  messages?: (Pick<IMessage, 'role'> & {
    content: string | null
  } & Partial<Pick<IMessage, 'full_content' | 'images'>>)[]
  settings?: Partial<IChatTextSettings>
}) => Promise<number>

export const buildTokenizeG4F =
  (): Tokenize =>
  async ({ modelId, messages, settings }) => {
    let tokens = 0

    if (settings) {
      tokens += tokenize(settings.full_system_prompt ?? settings.system_prompt ?? '', modelId)
    }

    if (messages && messages.length > 0) {
      tokens += messages.reduce((totalTokens, message) => {
        let imagesTokens: number

        if (message.images) {
          imagesTokens = message.images
            .map(({ width, height }) => Math.ceil(Math.ceil(width / 512) * Math.ceil(height / 512) * 170 + 85))
            .reduce((imagesTokens, tokens) => imagesTokens + tokens, 0)
        } else {
          imagesTokens = 0
        }

        const textTokens = tokenize(message.full_content ?? message.content ?? '', modelId)

        return totalTokens + imagesTokens + textTokens
      }, 0)
    }

    return tokens
  }
