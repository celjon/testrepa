import mime from 'mime-types'
import { AdapterParams } from '@/adapter/types'
import { OpenAiVisionModerateResponseDto } from '@/domain/dto'
import { ModerationMultiModalInput } from 'openai/resources'
import { StorageGateway } from '../storage'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'

type Params = Pick<AdapterParams, 'openaiModerationBalancer'> & {
  storageGateway: StorageGateway
}

export type VisionModerate = (params: { images: Array<string> }) => Promise<OpenAiVisionModerateResponseDto>

export const buildVisionModerate = ({ openaiModerationBalancer, storageGateway }: Params): VisionModerate => {
  return async ({ images }) => {
    try {
      if (images.length === 0) return { flagged: false }

      const { client } = openaiModerationBalancer.next()

      const results = await Promise.all(
        images.map(async (imagePath) => {
          const buffer = await storageGateway.read({
            path: imagePath
          })

          const base64url = buffer.toString('base64')
          // remove query string and get mime type
          const mimeType = mime.lookup(imagePath.replace(/\?.*$/, ''))

          const imageInput: ModerationMultiModalInput = {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64url}`
            }
          }

          const moderation = await client.moderations.create({
            model: 'omni-moderation-latest',
            input: [imageInput]
          })

          const flagged: boolean = moderation.results.some((result) => result.flagged)

          return { flagged }
        })
      )

      return { flagged: results.some((result) => result.flagged) }
    } catch (error) {
      logger.error({
        location: 'visionModerate',
        message: getErrorString(error)
      })
      return { flagged: true }
    }
  }
}
