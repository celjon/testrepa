import { APIError, toFile } from 'openai'
import { ChatCompletion, ChatCompletionMessageParam, ImagesResponse } from 'openai/resources'
import { TranslationVerbose } from 'openai/resources/audio/translations'
import { Observable } from 'rxjs'
import { PassThrough, Readable } from 'stream'
import * as mm from 'music-metadata'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'
import { AdapterParams } from '@/adapter/types'
import { BaseError, InvalidDataError } from '@/domain/errors'
import { ModelUsage, RawStream, RawStreamChunk } from '../types'

type Params = Pick<AdapterParams, 'openaiBalancer' | 'openaiTranscriptionBalancer'>

export type SendRawStream = (
  params: {
    model: string
    messages: Array<ChatCompletionMessageParam>
    [key: string]: unknown
  },
  onEnd: (content: string, usage: ModelUsage | null) => void,
) => Promise<{
  responseStream: RawStream
}>

export const buildSendRawStream = ({ openaiBalancer }: Params): SendRawStream => {
  return async (params, onEnd) => {
    const openaiProvider = openaiBalancer.next()

    try {
      const stream = await openaiProvider.client.chat.completions.create({
        ...params,
        stream: true,
        stream_options: {
          include_usage: true,
        },
      })

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
            subscriber.error(error)
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
  messages: Array<ChatCompletionMessageParam>
  [key: string]: unknown
}) => Promise<{
  response: ChatCompletion
  usage: ModelUsage | null
}>

export const buildSendRawSync = ({ openaiBalancer }: Params): SendRawSync => {
  return async (params) => {
    try {
      const openaiProvider = openaiBalancer.next()
      const completions = await openaiProvider.client.chat.completions.create({
        ...params,
        stream: false,
      })

      return {
        response: completions,
        usage: completions.usage ?? null,
      }
    } catch (e: any) {
      if (e instanceof APIError) {
        logger.error({
          location: 'openaiGateway.sendRawSync',
          message: `${e.message}`,
          openaiKey: e.headers?.['Authorization']?.slice(0, 42),
          model: params.model,
          userId: params.endUserId,
        })

        throw new BaseError({
          httpStatus: e.status,
          message: e.message,
          code: e.code || undefined,
        })
      }

      throw e
    }
  }
}

export type ImagesGenerate = (params: unknown) => Promise<{
  response: ImagesResponse & {
    _request_id?: string | null
  }
}>

export const buildImagesGenerate = ({ openaiBalancer }: Params): ImagesGenerate => {
  return async (params) => {
    try {
      const openaiProvider = openaiBalancer.next()
      const response = await openaiProvider.client.images.generate(params as any)

      return { response }
    } catch (e: any) {
      if (e instanceof APIError) {
        logger.error({
          location: 'openaiGateway.sendImage',
          message: `${e.message}`,
          openaiKey: e.headers?.['Authorization']?.slice(0, 42),
        })

        throw new BaseError({
          httpStatus: e.status,
          message: e.message,
          code: e.code || undefined,
        })
      }

      throw e
    }
  }
}

export type TranscriptionsCreate = (params: {
  model: string
  file: Readable
  fileName: string
  language?: string
  prompt?: string
  response_format?: 'text' | 'json' | 'srt' | 'verbose_json' | 'vtt'
  temperature?: number
  timestamp_granularities?: ('word' | 'segment')[]
}) => Promise<{
  response: {
    text: string
  }
  audioMetadata: {
    duration?: number
  }
}>

export const buildTranscriptionsCreate = ({
  openaiTranscriptionBalancer,
}: Params): TranscriptionsCreate => {
  return async (params) => {
    try {
      const openaiProvider = openaiTranscriptionBalancer.next()

      const clone = params.file.pipe(new PassThrough())

      const file = await toFile(params.file, params.fileName)

      const data = await openaiProvider.client.audio.transcriptions.create({
        model: params.model,
        file,
        language: params.language,
        prompt: params.prompt,
        response_format: params.response_format,
        temperature: params.temperature,
        timestamp_granularities: params.timestamp_granularities,
      })
      try {
        const { format } = await mm.parseStream(clone, {}, { duration: true })

        return {
          response: data,
          audioMetadata: {
            duration: format.duration ?? 1,
          },
        }
      } catch (error) {
        logger.error({
          location: 'openaiGateway.transcriptionsCreate[mm.parseStream]',
          message: getErrorString(error),
        })

        throw new InvalidDataError({
          code: 'METADATA_PARSING_ERROR',
        })
      }
    } catch (e: any) {
      if (e instanceof APIError) {
        logger.error({
          location: 'openaiGateway.transcriptionsCreate',
          message: `${e.message}`,
          openaiKey: e.headers?.['Authorization']?.slice(0, 42),
        })

        throw new BaseError({
          httpStatus: e.status,
          message: e.message,
          code: e.code || undefined,
        })
      }

      throw e
    }
  }
}

export type ModerationsCreate = (params: unknown) => Promise<{
  response: unknown
  tokens: number
}>

export const buildModerationsCreate = ({ openaiBalancer }: Params): ModerationsCreate => {
  return async (params) => {
    try {
      const openaiProvider = openaiBalancer.next()

      const data = await openaiProvider.client.moderations.create(params as any)

      return {
        response: data,
        tokens: 0,
      }
    } catch (e: any) {
      if (e instanceof APIError) {
        logger.error({
          location: 'openaiGateway.moderationsCreate',
          message: getErrorString(e),
          openaiKey: e.headers?.['Authorization']?.slice(0, 42),
        })

        throw new BaseError({
          httpStatus: e.status,
          message: e.message,
          code: e.code || undefined,
        })
      }

      throw e
    }
  }
}

export type TranslationsCreate = (params: {
  model: string
  file: Readable
  fileName: string
  prompt?: string
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt'
  temperature?: number
}) => Promise<{
  response: string | { text: string } | TranslationVerbose
  audioMetadata: {
    duration?: number
  }
}>

export const buildTranslationsCreate = ({ openaiBalancer }: Params): TranslationsCreate => {
  return async ({
    file,
    fileName,
    model,
    prompt,
    responseFormat = 'verbose_json',
    temperature,
  }) => {
    try {
      const openaiProvider = openaiBalancer.next()

      const openaiFile = await toFile(file, fileName)
      const stream = file.pipe(new PassThrough())

      const data = await openaiProvider.client.audio.translations.create({
        model,
        file: openaiFile,
        prompt,
        response_format: responseFormat,
        temperature,
      })

      const { format } = await mm.parseStream(stream, {}, { duration: true })

      return {
        response: data,
        audioMetadata: {
          duration: format.duration,
        },
      }
    } catch (e: any) {
      if (e instanceof APIError) {
        logger.error({
          location: 'openaiGateway.translationsCreate',
          message: getErrorString(e),
          openaiKey: e.headers?.['Authorization']?.slice(0, 42),
        })

        throw new BaseError({
          httpStatus: e.status,
          message: e.message,
          code: e.code || undefined,
        })
      }

      throw e
    }
  }
}

export type SpeechCreate = (params: {
  model: 'tts-1' | 'tts-1-hd'
  input: string
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm'
  speed?: number
}) => Promise<{
  response: unknown
}>

export const buildSpeechCreate = ({ openaiBalancer }: Params): SpeechCreate => {
  return async (params) => {
    try {
      const openaiProvider = openaiBalancer.next()

      const data = await openaiProvider.client.audio.speech.create(params)

      return {
        response: Buffer.from(await data.arrayBuffer()),
      }
    } catch (error: any) {
      if (error instanceof APIError) {
        logger.error({
          location: 'openaiGateway.speechCreate',
          message: getErrorString(error),
          openaiKey: error.headers?.['Authorization']?.slice(0, 42),
        })

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

export type EmbeddingsCreate = (params: {
  model: 'text-embedding-3-small' | 'text-embedding-ada-002' | 'text-embedding-3-large'
  input: string | Array<string> | Array<number> | Array<Array<number>>
  dimensions?: number
  response_format?: 'float' | 'base64'
  endUserId: string
}) => Promise<{
  response: unknown
}>

export const buildEmbeddingsCreate = ({ openaiBalancer }: Params): EmbeddingsCreate => {
  return async (params) => {
    try {
      const openaiProvider = openaiBalancer.next()

      const data = await openaiProvider.client.embeddings.create(params)

      return {
        response: data,
      }
    } catch (error: any) {
      if (error instanceof APIError) {
        logger.error({
          location: 'openaiGateway.embeddingsCreate',
          message: getErrorString(error),
          openaiKey: error.headers?.['Authorization']?.slice(0, 42),
        })

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
