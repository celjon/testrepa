import { AdapterParams } from '@/adapter/types'
import { IMessage } from '@/domain/entity/message'
import { IModel } from '@/domain/entity/model'
import { IChatVideoSettings } from '@/domain/entity/chat-settings'
import { NotFoundError } from '@/domain/errors'
import { Video } from '@/adapter/gateway/replicate/send-video'

type Params = Pick<AdapterParams, 'googleGenAI'>
export type GoogleGenAIGateway = {
  generateVideo: (params: {
    imageBytes: string
    message: IMessage
    model: IModel
    settings: Partial<IChatVideoSettings>
  }) => Promise<Video>
}

export const buildGoogleGenAIGateway = ({ googleGenAI }: Params): GoogleGenAIGateway => {
  return {
    generateVideo: async ({ imageBytes, message, model, settings }) => {
      let modelId
      if (model.id === 'veo-2') {
        modelId = 'veo-2.0-generate-001'
      } else if (model.id === 'veo-3') {
        modelId = 'veo-3.0-generate-preview'
      } else {
        throw new NotFoundError({
          code: 'MODEL_NOT_FOUND',
        })
      }

      let operation = await googleGenAI.client.models.generateVideos({
        model: modelId,
        prompt: message.content ?? '',
        image: imageBytes ? { imageBytes, mimeType: 'jpeg' } : undefined,
        config: {
          aspectRatio: settings.aspect_ratio ?? '16:9',
          durationSeconds: settings.duration_seconds,
        },
      })
      while (!operation.done) {
        await new Promise((res) => setTimeout(res, 5000))
        operation = await googleGenAI.client.operations.getVideosOperation({ operation })
      }

      const videoInBase64 = operation.response?.generatedVideos?.[0].video?.videoBytes
      if (!videoInBase64) {
        throw new Error('Invalid output from Google Gen AI')
      }

      const buffer = Buffer.from(videoInBase64, 'base64')
      const ext = 'mp4'

      return { buffer, ext: `.${ext}` }
    },
  }
}
