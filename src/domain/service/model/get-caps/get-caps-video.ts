import { logger } from '@/lib/logger'
import { ForbiddenError } from '@/domain/errors'
import { IChatSettings } from '@/domain/entity/chat-settings'
import { IModel, isVideoModel } from '@/domain/entity/model'
import { replicateVideoPricingSchema } from '../pricing-schemas'

type Params = {}

export type GetCapsVideo = (params: { model: IModel; settings?: IChatSettings }) => Promise<number>

export const buildGetCapsVideo =
  (_: Params): GetCapsVideo =>
  async ({ model, settings }) => {
    if (isVideoModel(model) && settings?.video?.duration_seconds) {
      const pricingResult = await replicateVideoPricingSchema.safeParseAsync(model.pricing)
      if (!pricingResult.success) {
        logger.error({
          location: 'getCaps.video',
          message: 'Cannot determine pricing for this model',
          model: model.id,
          pricingResult,
        })
        throw new ForbiddenError({
          code: 'INVALID_MODEL_PRICING',
        })
      }
      const pricing = pricingResult.data

      if (model.id === 'veo-3') {
        const priceForVeo3HighQuality = 1.2
        return settings.video.quality === 'standard'
          ? 8 * pricing.per_second * pricing.discount
          : 8 * pricing.per_second * pricing.discount * priceForVeo3HighQuality
      }

      return settings.video.duration_seconds * pricing.per_second * pricing.discount
    } else {
      logger.error({
        location: 'getCaps.video',
        message: 'Cannot determine pricing for this model',
        model: model.id,
      })
      throw new ForbiddenError({
        code: 'INVALID_MODEL_PRICING',
        message: `Cannot determine pricing for this model: ${model.id}`,
      })
    }
  }
