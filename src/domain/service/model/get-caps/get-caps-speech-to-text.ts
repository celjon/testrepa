import { logger } from '@/lib/logger'
import { ForbiddenError } from '@/domain/errors'
import { IModel, isSpeechToTextModel } from '@/domain/entity/model'
import { audioPricingSchema } from '../pricing-schemas'

type Params = {}

export type GetCapsSpeechToText = (params: {
  model: IModel
  params?: unknown
  audioMetadata?: {
    duration?: number
  }
}) => Promise<number>

export const buildGetCapsSpeechToText =
  (_: Params): GetCapsSpeechToText =>
  async ({ model, params, audioMetadata }) => {
    if (isSpeechToTextModel(model) && audioMetadata && audioMetadata.duration) {
      const pricingResult = await audioPricingSchema.safeParseAsync(model.pricing)

      if (!pricingResult.success) {
        logger.error({
          location: 'getCaps.speechToText',
          message: 'Cannot determine pricing for this model',
          model: model.id,
          pricingResult,
        })
        throw new ForbiddenError({
          code: 'INVALID_MODEL_PRICING',
        })
      }

      const pricing = pricingResult.data

      return (audioMetadata.duration / 60) * pricing.input * pricing.discount
    } else {
      logger.error({
        location: 'getCaps.speechToText',
        message: 'Cannot determine pricing for this model',
        model: model.id,

        params,
      })
      throw new ForbiddenError({
        code: 'INVALID_MODEL_PRICING',
        message: `Cannot determine pricing for this model: ${model.id}`,
      })
    }
  }
