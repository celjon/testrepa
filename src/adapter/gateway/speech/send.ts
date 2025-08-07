import { AdapterParams } from '@/adapter/types'
import { BaseError } from '@/domain/errors'
import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { isAxiosError } from 'axios'
import { ClientRequest } from 'http'

type Params = Pick<AdapterParams, 'openaiBalancer'>

export type Send = (params: {
  input: string
  settings: {
    model: 'tts-1' | 'tts-1-hd'
    voice: 'fable' | 'alloy' | 'onyx' | 'nova' | 'shimmer' | 'echo'
    response_format: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm'
  }
}) => Promise<{
  buffer: Buffer
}>

export const buildSend = ({ openaiBalancer }: Params): Send => {
  return async ({ input, settings }) => {
    try {
      const openaiProvider = openaiBalancer.next()

      const audio = await openaiProvider.client.audio.speech.create({
        input,
        ...settings,
      })

      const buffer = Buffer.from(await audio.arrayBuffer())

      return {
        buffer,
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const req = error.request as ClientRequest
        const apiKey = req.getHeader('Authorization')

        logger.error({
          location: 'speechGateway.send',
          message: getErrorString(error),
          apiKey: typeof apiKey === 'string' ? apiKey.slice(0, 42) : apiKey,
        })

        if (error.response) {
          throw new BaseError({
            httpStatus: error.response.status,
            message: `OpenAi error: ${error.response.data.error?.code}`,
            code: error.response.data.error?.code || 'OPENAI_ERROR',
          })
        }
      }

      throw error
    }
  }
}
