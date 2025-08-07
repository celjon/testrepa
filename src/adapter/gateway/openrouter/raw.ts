import { z } from 'zod'
import { APIError } from 'openai'
import {
  ChatCompletion,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionMessageParam,
} from 'openai/resources'
import { Observable } from 'rxjs'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'
import { AdapterParams } from '@/adapter/types'
import { BaseError } from '@/domain/errors'
import { ModelUsage, RawStream, RawStreamChunk } from '../types'

type Params = Pick<AdapterParams, 'openRouterBalancer'>

export type SendRawStream = (
  params: {
    model: string
    messages: Array<ChatCompletionMessageParam>
    endUserId: string
    provider?: {
      order?: string[]
    }
    middleOut: boolean
    [key: string]: unknown
  },
  onEnd: (content: string, usage: ModelUsage | null) => void,
) => Promise<{
  responseStream: RawStream
}>

export const buildSendRawStream = ({ openRouterBalancer }: Params): SendRawStream => {
  return async ({ model, provider, ...params }, onEnd) => {
    try {
      const openRouterProvider = openRouterBalancer.next()

      const stream = await openRouterProvider.client.chat.completions.create({
        ...(params.middleOut ? { transforms: ['middle-out'] as const } : {}),
        ...params,
        stream: true,
        stream_options: {
          include_usage: true,
        },
        model,
        ...{ provider },
      } satisfies ChatCompletionCreateParamsStreaming)

      let content = ''

      const responseStream = new Observable<RawStreamChunk>((subscriber) => {
        const processStream = async () => {
          try {
            for await (const chunk of stream) {
              if (chunk.choices && chunk.choices[0]?.delta?.content) {
                content += chunk.choices[0]?.delta?.content
              }

              if (chunk.usage) {
                subscriber.next(chunk)
                onEnd(content, chunk.usage ?? null)
              } else {
                subscriber.next(chunk)
              }
            }

            subscriber.complete()
          } catch (error) {
            if (isOpenrouterError(error)) {
              subscriber.error(
                error.error.metadata.raw ?? {
                  error: { message: error.error.message },
                },
              )
            } else {
              subscriber.error(error)
            }
          }
        }

        processStream()
        return () => {
          stream.controller.abort()
        }
      })

      return {
        responseStream,
      }
    } catch (error) {
      logger.error({
        location: 'openrouterGateway.sendRawSync',
        message: getErrorString(error),
        openaiKey: error.headers?.['Authorization']?.slice(0, 42),
        model: params.model,
        userId: params.endUserId,
      })

      if (isOpenrouterError(error)) {
        throw new BaseError({
          httpStatus: error.error.code,
          message:
            (typeof error.error.metadata.raw === 'string'
              ? error.error.metadata.raw
              : JSON.stringify(error.error.metadata.raw)) ?? error.error.message,
          code: undefined,
        })
      }

      if (error instanceof APIError) {
        throw new BaseError({
          httpStatus: error.status,
          message: error.message,
          code: error.code || undefined,
        })
      }

      throw error
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
  middleOut: boolean
  [key: string]: unknown
}) => Promise<{
  response: ChatCompletion
  usage: ModelUsage | null
}>

export const buildSendRawSync = ({ openRouterBalancer }: Params): SendRawSync => {
  return async (params) => {
    try {
      const openRouterProvider = openRouterBalancer.next()
      const completions = await openRouterProvider.client.chat.completions.create({
        ...(params.middleOut ? { transforms: ['middle-out'] as const } : {}),
        ...params,
        stream: false,
      })

      if ('error' in completions && completions.error) {
        throw completions
      }

      return {
        response: completions,
        usage: completions.usage ?? null,
      }
    } catch (error) {
      logger.error({
        location: 'openrouterGateway.sendRawSync',
        message: getErrorString(error),
        openaiKey: error.headers?.['Authorization']?.slice(0, 42),
        model: params.model,
        userId: params.endUserId,
      })

      if (isOpenrouterError(error)) {
        throw new BaseError({
          httpStatus: error.error.code,
          message:
            (typeof error.error.metadata.raw === 'string'
              ? error.error.metadata.raw
              : JSON.stringify(error.error.metadata.raw)) ?? error.error.message,
          code: undefined,
        })
      }

      if (error instanceof APIError) {
        throw new BaseError({
          httpStatus: error.status,
          message: error.message,
          code: error.code || undefined,
        })
      }

      throw error
    }
  }
}

const openrouterErrorSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.number(),
    metadata: z.object({
      raw: z.union([z.string(), z.object({})]).optional(),
      provider_name: z.string(),
    }),
  }),
})

type OpenrouterError = z.infer<typeof openrouterErrorSchema>

export function isOpenrouterError(e: unknown): e is OpenrouterError {
  return openrouterErrorSchema.safeParse(e).success
}
