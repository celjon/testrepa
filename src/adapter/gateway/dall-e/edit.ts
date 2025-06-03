import { extname } from 'node:path'
import { toFile } from 'openai'
import mime from 'mime-types'
import { ImageEditParams } from 'openai/resources'
import { isAxiosError } from 'axios'
import { AdapterParams } from '@/adapter/types'
import { logger } from '@/lib/logger'
import { getB64Extension } from '@/lib/utils/getB64Extension'
import { IMessage } from '@/domain/entity/message'
import { BaseError, InternalError } from '@/domain/errors'
import { IChatImageSettings } from '@/domain/entity/chatSettings'
import { StorageGateway } from '../storage'

type Params = Pick<AdapterParams, 'openaiDalleBalancer'> & {
  storageGateway: StorageGateway
}

export type Edit = (params: { message: IMessage; settings: Partial<IChatImageSettings>; endUserId: string }) => Promise<{
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

export const buildEdit = ({ openaiDalleBalancer, storageGateway }: Params): Edit => {
  return async ({ message, settings, endUserId }) => {
    try {
      const { client } = openaiDalleBalancer.next()

      const inputImages = await Promise.all(
        (message.images || []).map(async (messageImage, idx) => {
          const ext = extname(messageImage.original!.path!)
          const mimeType = mime.lookup(messageImage.original!.path!.replace(/\?.*$/, ''))

          const buffer = await storageGateway.read({
            path: messageImage.original!.path!
          })

          return toFile(buffer, `image${idx}${ext}`, {
            type: mimeType || 'text/png'
          })
        })
      )

      const { data, usage } = await client.images.edit({
        model: settings.model,
        prompt: `${message.full_content ?? message.content ?? ''} ${message.voice?.content ?? ''} ${message.video?.content ?? ''}`,
        image: inputImages,
        size: (settings.size ?? '1024x1024') as ImageEditParams['size'],
        ...(settings.model !== 'dall-e-2' && {
          quality: (settings.quality ?? 'standard') as ImageEditParams['quality']
        }),
        ...(settings.model !== 'gpt-image-1' && {
          response_format: 'b64_json'
        }),
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
