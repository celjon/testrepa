import { logger } from '@/lib/logger'
import { ForbiddenError } from '@/domain/errors'
import { IModel, isTextModel } from '@/domain/entity/model'
import { TextPricingParams, textPricingParamsSchema, textPricingSchema } from '../pricing-schemas'

type Params = {}

export type GetCapsText = (params: { model: IModel; usage?: TextPricingParams }) => Promise<number>

export const buildGetCapsText =
  (_: Params): GetCapsText =>
  async ({ model, usage }) => {
    if (isTextModel(model) && usage) {
      const pricingResult = await textPricingSchema.safeParseAsync(model.pricing)
      const paramsResult = await textPricingParamsSchema.safeParseAsync(usage)

      if (!pricingResult.success) {
        logger.error({
          location: 'getCaps.text',
          message: 'Cannot determine pricing for this model',
          model: model.id,
          pricingResult,
        })
        throw new ForbiddenError({
          code: 'INVALID_MODEL_PRICING',
        })
      }
      if (!paramsResult.success) {
        logger.error({
          location: 'getCaps.text',
          message: 'Cannot determine usage for this model',
          model: model.id,
        })
        throw new ForbiddenError({
          code: 'INVALID_PARAMS',
        })
      }

      const { input = 1, output = 1, discount = 1 } = pricingResult.data
      const { prompt_tokens = 0, completion_tokens = 0 } = paramsResult.data

      return (prompt_tokens * input + completion_tokens * output) * discount
    } else {
      logger.error({
        location: 'getCaps.text',
        message: 'Cannot determine pricing for this model',
        model: model.id,
        usage: usage,
      })
      throw new ForbiddenError({
        code: 'INVALID_MODEL_PRICING',
        message: `Cannot determine pricing for this model: ${model.id}`,
      })
    }
  }
