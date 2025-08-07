import { AdapterParams } from '@/adapter/types'
import { logger } from '@/lib/logger'
import { IMessage } from '@/domain/entity/message'
import { isAxiosError } from 'axios'
import { BaseError, InternalError } from '@/domain/errors'
import { IChatImageSettings } from '@/domain/entity/chat-settings'
import { ImageGenerateParams } from 'openai/resources'
import { getB64Extension } from '@/lib/utils/get-b64-extension'

type Params = Pick<AdapterParams, 'g4f'>

export type SendImage = (params: {
  message: IMessage
  settings: Partial<IChatImageSettings>
  endUserId: string
}) => Promise<
  {
    base64: string
    buffer: Buffer
    ext: string
  }[]
>

export const buildSendImage = ({ g4f }: Params): SendImage => {
  return async ({ message, settings, endUserId }) => {
    try {
      const { client } = g4f

      const { data } = await client.images.generate({
        model: settings.model,
        prompt: message.content ?? '',
        size: (settings.size ?? '1024x1024') as ImageGenerateParams['size'],
        quality: (settings.quality ?? 'standard') as ImageGenerateParams['quality'],
        ...(settings.style &&
          settings.style !== 'default' && {
            style: settings.style as ImageGenerateParams['style'],
          }),
        response_format: 'b64_json',
        user: endUserId,
      })

      if (!data) {
        throw new InternalError()
      }

      return data
        .filter((image) => !!image.b64_json)
        .map((image) => {
          const base64 = image.b64_json as string
          const base64String = base64.replace(/^data:image\/\w+;base64,/, '')
          const buffer = Buffer.from(base64String, 'base64')
          const ext = getB64Extension(base64String)

          return { base64, buffer, ext }
        })
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response) {
          logger.error({
            location: 'g4fGateway.sendImage',
            message: `${JSON.stringify(error?.response?.data || '')}`,
          })

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
