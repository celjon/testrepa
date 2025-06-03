import { AdapterParams } from '@/adapter/types'
import { BaseError, InvalidDataError } from '@/domain/errors'
import { APIError, toFile } from 'openai'
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionCreateParamsStreaming, ImagesResponse } from 'openai/resources'
import { PassThrough, Readable } from 'stream'
import * as mm from 'music-metadata'
import { TranslationVerbose } from 'openai/resources/audio/translations'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'

type Params = Pick<AdapterParams, 'openaiBalancer' | 'openaiTranscriptionBalancer'>

export type SendRawStream = (
  params: {
    model: string
    messages: Array<{
      role: string
      content:
        | string
        | Array<
            | {
                type: 'text'
                text: string
              }
            | {
                type: 'image_url'
                image_url: {
                  url: string
                }
              }
          >
    }>
    endUserId: string
    [key: string]: unknown
  },
  onEnd: (content: string) => void
) => Promise<{
  responseBytesStream: Readable
  breakNotifier: () => void
}>

export const buildSendRawStream = ({ openaiBalancer }: Params): SendRawStream => {
  return async (params, onEnd) => {
    const openaiProvider = openaiBalancer.next()
    const request = params as any as ChatCompletionCreateParamsStreaming

    try {
      const stream = await openaiProvider.client.chat.completions.create({
        ...request,
        stream_options: {
          include_usage: true
        }
      })

      let content = ''
      let finalSent = false

      const streamIterator = stream[Symbol.asyncIterator]()

      const responseBytesStream = new Readable({
        async read() {
          const chunk = await streamIterator.next()
          if (chunk.done) {
            this.push('[DONE]')
            this.emit('end')
            this.emit('close')
            return
          }

          if (chunk.value.choices && chunk.value.choices[0]?.delta?.content) {
            content += chunk.value.choices[0]?.delta?.content
          }

          this.push(`data: ${JSON.stringify(chunk.value)}\n\n`)
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
        onEnd(content)
      }
      return {
        responseBytesStream,
        breakNotifier
      }
    } catch (e) {
      if (e instanceof APIError) {
        logger.error({
          location: 'openaiGateway.sendRawStream',
          message: `${e.message}`,
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
  messages: Array<{
    role: string
    content:
      | string
      | Array<
          | {
              type: 'text'
              text: string
            }
          | {
              type: 'image_url'
              image_url: {
                url: string
              }
            }
        >
  }>
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
  tokens: number
}>

export const buildSendRawSync = ({ openaiBalancer }: Params): SendRawSync => {
  return async (params) => {
    try {
      const openaiProvider = openaiBalancer.next()
      const request = params as any as ChatCompletionCreateParamsNonStreaming
      const completions = await openaiProvider.client.chat.completions.create({
        ...request,
        stream_options: {
          include_usage: true
        }
      })
      const usedTokens = completions.usage ? completions.usage.total_tokens : 0

      return {
        response: completions,
        tokens: usedTokens
      }
    } catch (e: any) {
      if (e instanceof APIError) {
        logger.error({
          location: 'openaiGateway.sendRawSync',
          message: `${e.message}`,
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

export const buildTranscriptionsCreate = ({ openaiTranscriptionBalancer }: Params): TranscriptionsCreate => {
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
        timestamp_granularities: params.timestamp_granularities
      })
      try {
        const { format } = await mm.parseStream(clone, {}, { duration: true })

        return {
          response: data,
          audioMetadata: {
            duration: format.duration ?? 1
          }
        }
      } catch (error) {
        logger.error({
          location: 'openaiGateway.transcriptionsCreate[mm.parseStream]',
          message: getErrorString(error)
        })

        throw new InvalidDataError({
          code: 'METADATA_PARSING_ERROR'
        })
      }
    } catch (e: any) {
      if (e instanceof APIError) {
        logger.error({
          location: 'openaiGateway.transcriptionsCreate',
          message: `${e.message}`,
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
        tokens: 0
      }
    } catch (e: any) {
      if (e instanceof APIError) {
        logger.error({
          location: 'openaiGateway.moderationsCreate',
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
  return async ({ file, fileName, model, prompt, responseFormat = 'verbose_json', temperature }) => {
    try {
      const openaiProvider = openaiBalancer.next()

      const openaiFile = await toFile(file, fileName)
      const stream = file.pipe(new PassThrough())

      const data = await openaiProvider.client.audio.translations.create({
        model,
        file: openaiFile,
        prompt,
        response_format: responseFormat,
        temperature
      })

      const { format } = await mm.parseStream(stream, {}, { duration: true })

      return {
        response: data,
        audioMetadata: {
          duration: format.duration
        }
      }
    } catch (e: any) {
      if (e instanceof APIError) {
        logger.error({
          location: 'openaiGateway.translationsCreate',
          message: getErrorString(e),
          openaiKey: e.headers?.['Authorization']
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
        response: Buffer.from(await data.arrayBuffer())
      }
    } catch (error: any) {
      if (error instanceof APIError) {
        logger.error({
          location: 'openaiGateway.speechCreate',
          message: getErrorString(error),
          openaiKey: error.headers?.['Authorization']?.slice(0, 42)
        })

        throw new BaseError({
          httpStatus: error.status,
          message: error.message,
          code: error.code || undefined
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
        response: data
      }
    } catch (error: any) {
      if (error instanceof APIError) {
        logger.error({
          location: 'openaiGateway.embeddingsCreate',
          message: getErrorString(error),
          openaiKey: error.headers?.['Authorization']?.slice(0, 42)
        })

        throw new BaseError({
          httpStatus: error.status,
          message: error.message,
          code: error.code || undefined
        })
      }

      throw error
    }
  }
}
