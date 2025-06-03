import { z } from 'zod'
import { APIError } from 'openai'
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from 'openai/resources'
import { Readable } from 'stream'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'
import { AdapterParams } from '@/adapter/types'
import { BaseError } from '@/domain/errors'
import { ModelUsage } from '../types'

type Params = Pick<AdapterParams, 'openRouterBalancer'>

export type SendRawStream = (
  params: {
    model: string
    messages: Array<ChatCompletionMessageParam>
    endUserId: string
    provider?: {
      order?: string[]
    }
    [key: string]: unknown
  },
  onEnd: (content: string, usage: ModelUsage | null) => void
) => Promise<{
  responseBytesStream: Readable
  breakNotifier: () => void
}>

export const buildSendRawStream = ({ openRouterBalancer }: Params): SendRawStream => {
  return async ({ model, provider, ...params }, onEnd) => {
    const openRouterProvider = openRouterBalancer.next()

    try {
      const stream = await openRouterProvider.client.chat.completions.create({
        ...{
          ...params,
          provider,
          transforms: ['middle-out'] as const,
          stream: true,
          stream_options: {
            include_usage: true
          }
        },
        model
      })

      let content = ''
      let finalSent = false
      let usage: ModelUsage | null = null

      const streamIterator = stream[Symbol.asyncIterator]()

      const responseBytesStream = new Readable({
        async read() {
          try {
            const chunk = await streamIterator.next()

            if (chunk.done) {
              this.push('[DONE]')
              this.emit('end')
              return
            }

            if (chunk.value.usage) {
              usage = chunk.value.usage ?? null
            }

            if (chunk.value.choices && chunk.value.choices[0]?.delta?.content) {
              content += chunk.value.choices[0]?.delta?.content
            }

            this.push(`data: ${JSON.stringify(chunk.value)}\n\n`)
          } catch (e) {
            if (e instanceof APIError) {
              logger.error({
                location: 'openrouterGateway.sendRawStream',
                message: getErrorString(e),
                openaiKey: e.headers?.['Authorization']?.slice(0, 42)
              })
            }

            if (isOpenrouterError(e)) {
              this.push(
                `error: ${
                  e.error.metadata.raw ??
                  JSON.stringify({
                    error: {
                      message: e.error.message
                    }
                  })
                }\n\n`
              )
            } else {
              this.push(`error: ${JSON.stringify(e)}\n\n`)
            }

            this.push('[DONE]')
            this.emit('end')
          }
        }
      })

      responseBytesStream.on('end', () => {
        if (!finalSent) {
          finalSent = true
          onDone()
        }
      })

      responseBytesStream.on('error', () => {
        if (!finalSent) {
          finalSent = true
          onDone()
        }
      })

      const breakNotifier = async () => {
        if (!finalSent) {
          finalSent = true
          onDone()
          responseBytesStream.emit('end')
          stream.controller.abort()
        }
      }

      const onDone = () => {
        onEnd(content, usage)
      }
      return {
        responseBytesStream,
        breakNotifier
      }
    } catch (e) {
      if (e instanceof APIError) {
        logger.error({
          location: 'openrouterGateway.sendRawStream',
          message: getErrorString(e),
          openaiKey: e.headers?.['Authorization']?.slice(0, 42)
        })

        throw new BaseError({
          httpStatus: e.status,
          message: e.message,
          code: e.code || undefined
        })
      }

      throw e
    }
  }
}

export type SendRawSync = (params: {
  model: string
  endUserId: string
  messages: Array<ChatCompletionMessageParam>
  provider?: {
    order?: string[]
  }
  [key: string]: unknown
}) => Promise<{
  response: {
    choices: {
      message: {
        role: 'assistant'
        content: string | null
      }
    }[]
  }
  usage: ModelUsage | null
}>

export const buildSendRawSync = ({ openRouterBalancer }: Params): SendRawSync => {
  return async (params) => {
    try {
      const openRouterProvider = openRouterBalancer.next()
      const completions = await openRouterProvider.client.chat.completions.create({
        ...params,
        transforms: ['middle-out'] as const,
        stream: false,
        stream_options: {
          include_usage: true
        }
      } as ChatCompletionCreateParamsNonStreaming)

      if ('error' in completions && completions.error) {
        throw completions
      }

      return {
        response: completions,
        usage: completions.usage ?? null
      }
    } catch (e: any) {
      if (e instanceof APIError) {
        logger.error({
          location: 'openrouterGateway.sendRawSync',
          message: getErrorString(e),
          openaiKey: e.headers?.['Authorization']?.slice(0, 42)
        })

        throw new BaseError({
          httpStatus: e.status,
          message: e.message,
          code: e.code || undefined
        })
      }

      if (isOpenrouterError(e)) {
        throw new BaseError({
          httpStatus: e.error.code,
          message: e.error.metadata.raw ?? e.error.message,
          code: undefined
        })
      }

      throw e
    }
  }
}

const openrouterErrorSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.number(),
    metadata: z.object({
      raw: z.string().optional(),
      provider_name: z.string()
    })
  })
})

type OpenrouterError = z.infer<typeof openrouterErrorSchema>

export function isOpenrouterError(e: unknown): e is OpenrouterError {
  return openrouterErrorSchema.safeParse(e).success
}
