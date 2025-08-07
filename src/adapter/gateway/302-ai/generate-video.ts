import { AdapterParams } from '@/adapter/types'
import { IMessage } from '@/domain/entity/message'
import { IModel } from '@/domain/entity/model'
import { IChatVideoSettings } from '@/domain/entity/chat-settings'
import { NotFoundError } from '@/domain/errors'
import { Video } from '@/adapter/gateway/replicate/send-video'

type Params = Pick<AdapterParams, 'ai302'>

export type GenerateVideo = {
  generateVideo: (params: {
    imageUrl: string
    message: IMessage
    model: IModel
    settings: Partial<IChatVideoSettings>
  }) => Promise<Video>
}

export const buildGenerateVideo = ({ ai302 }: Params): GenerateVideo => {
  return {
    generateVideo: async ({ imageUrl, message, model, settings }) => {
      if (model.id !== 'veo-3') {
        throw new NotFoundError({ code: 'MODEL_NOT_FOUND' })
      }
      const payload = {
        text_prompt: message.content,
        input_image: imageUrl,
        quality: settings.quality,
      }
      const { taskId } = await ai302.client.generateVideoFromImage({
        data: payload,
      })
      const maxAttempts = 200
      const delay = 5000
      let attempts = 0

      while (attempts < maxAttempts) {
        const result = await ai302.client.getVideoResult(taskId, settings.quality ?? 'high')
        if (result?.status === 'completed') {
          const url = result.video_url || result.upsample_video_url
          if (!url) {
            throw new Error(`Missing video URL for task ${taskId}`)
          }

          const res = await fetch(url)
          const arrayBuffer = await res.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          return { buffer, ext: '.mp4' }
        }

        if (result?.status === 'failed') {
          throw new Error(`Video generation failed for task ${taskId}`)
        }

        await new Promise((r) => setTimeout(r, delay))
        attempts++
      }

      throw new Error('Video generation timed out')
    },
  }
}
