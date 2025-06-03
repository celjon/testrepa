import { AdapterParams } from '@/adapter/types'
import { logger } from '@/lib/logger'
import { IMessage } from '@/domain/entity/message'
import { isAxiosError } from 'axios'
import { BaseError, InternalError } from '@/domain/errors'
import { IChatImageSettings } from '@/domain/entity/chatSettings'
import { ImageGenerateParams } from 'openai/resources'
import { getB64Extension } from '@/lib/utils/getB64Extension'

type Params = Pick<AdapterParams, 'openaiDalleBalancer'>

export type Send = (params: { message: IMessage; settings: Partial<IChatImageSettings>; endUserId: string }) => Promise<{
  images: {
    base64: string
    buffer: Buffer
    ext: string
  }[]
  usage: {
    input_text_tokens: number
    input_image_tokens: number
    output_image_tokens: number
  } | null
}>

export const buildSend = ({ openaiDalleBalancer }: Params): Send => {
  return async ({ message, settings, endUserId }) => {
    try {
      const { client } = openaiDalleBalancer.next()

      const { data, usage } = await client.images.generate({
        model: settings.model,
        prompt: `${message.full_content ?? message.content ?? ''} ${message.voice?.content ?? ''} ${message.video?.content ?? ''}`,
        size: (settings.size ?? '1024x1024') as ImageGenerateParams['size'],
        ...(settings.model !== 'dall-e-2' && {
          quality: (settings.quality ?? 'standard') as ImageGenerateParams['quality']
        }),
        ...(settings.style &&
          settings.style !== 'default' && {
            style: settings.style as ImageGenerateParams['style']
          }),
        ...(settings.model !== 'gpt-image-1' && {
          response_format: 'b64_json'
        }),
        ...(settings.model === 'gpt-image-1' && { moderation: 'low' }),
        user: endUserId
      })

      if (!data) {
        throw new InternalError()
      }

      const images = data
        .filter((image) => !!image.b64_json)
        .map((image) => {
          const base64 = image.b64_json as string
          const base64String = base64.replace(/^data:image\/\w+;base64,/, '')
          const buffer = Buffer.from(base64String, 'base64')
          const ext = getB64Extension(base64String)

          return { base64, buffer, ext }
        })

      return {
        images,
        usage: usage
          ? {
              input_text_tokens: usage.input_tokens_details.text_tokens,
              input_image_tokens: usage.input_tokens_details.image_tokens,
              output_image_tokens: usage.output_tokens
            }
          : null
      }
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response) {
          logger.error({
            location: 'dalleGateway.send',
            message: `${JSON.stringify(error?.response?.data || '')}`
          })

          throw new BaseError({
            httpStatus: error.response.status,
            message: `OpenAi error: ${error.response.data.error?.code}`,
            code: error.response.data.error?.code || 'OPENAI_ERROR'
          })
        }
      }

      throw error
    }
  }
}
