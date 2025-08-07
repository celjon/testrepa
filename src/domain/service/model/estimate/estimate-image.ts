import { tokenize } from '@/lib/tokenizer'
import { IModel, isGPTImageModel } from '@/domain/entity/model'
import { IChatMidjourneySettings, IChatSettings } from '@/domain/entity/chat-settings'
import { RawFile } from '@/domain/entity/file'
import { IMessage } from '@/domain/entity/message'
import { GetCapsImage } from '@/domain/service/model/get-caps/get-caps-image'

type Params = { getCapsImage: GetCapsImage }

type EstimateImageParams = {
  gptImage?: {
    model: IModel
    settings: IChatSettings
    userMessage: IMessage
    files: RawFile[]
  }
  replicateImage?: { model: IModel; settings: IChatSettings }
  mj?: { model: IModel; mjSettings: IChatMidjourneySettings }
}

export type EstimateImage = (data: EstimateImageParams) => Promise<number>
export const buildEstimateImage = ({ getCapsImage }: Params): EstimateImage => {
  return async (data: EstimateImageParams) => {
    let estimate = 0
    if (data.gptImage) {
      const { model, settings, userMessage, files } = data.gptImage
      const costGptImageRateByQuality = {
        '1024x1024': { low: 272, medium: 1056, high: 4160 },
        '1536x1024': { low: 408, medium: 1584, high: 6240 },
        '1024x1536': { low: 400, medium: 1568, high: 6208 },
      }
      const usage = isGPTImageModel(model)
        ? {
            input_text_tokens: tokenize(userMessage.content!, model.id),
            input_image_tokens: files.length,
            output_image_tokens:
              costGptImageRateByQuality[
                settings!.image!.size as '1024x1024' | '1024x1536' | '1536x1024'
              ][settings!.image!.quality as 'low' | 'medium' | 'high'],
          }
        : undefined

      estimate = await getCapsImage({
        model: model!,
        settings: settings,
        usage,
      })
    } else if (data.replicateImage) {
      const { model, settings } = data.replicateImage
      estimate = await getCapsImage({
        model,
        settings,
      })
    } else if (data.mj) {
      const { model, mjSettings } = data.mj
      estimate = await getCapsImage({
        model,
        message: { mj_mode: mjSettings.mode },
      })
    }
    return estimate
  }
}
