import { logger } from '@/lib/logger'
import { ForbiddenError } from '@/domain/errors'
import { IModel, isTextToSpeechModel } from '@/domain/entity/model'
import {
  ImageLLMPricingParams,
  speechPricingParamsSchema,
  speechPricingSchema,
  TextPricingParams,
} from '../pricing-schemas'

type Params = {}

export type GetCapsTextToSpeech = (params: {
  model: IModel
  usage?: TextPricingParams | ImageLLMPricingParams
  params?: unknown
}) => Promise<number>

export const buildGetCapsTextToSpeech =
  (_: Params): GetCapsTextToSpeech =>
  async ({ model, usage, params }) => {
    if (isTextToSpeechModel(model) && params) {
      const [pricingResult, paramsResult] = await Promise.all([
        speechPricingSchema.safeParseAsync(model.pricing),
        speechPricingParamsSchema.safeParseAsync(params),
      ])

      if (!pricingResult.success) {
        logger.error({
          location: 'getCaps.textToSpeech',
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
          location: 'getCaps.textToSpeech',
          message: 'Cannot determine usage for this model',
          model: model.id,
          params,
        })
        throw new ForbiddenError({
          code: 'INVALID_PARAMS',
        })
      }

      const pricing = pricingResult.data
      const { input } = paramsResult.data

      return input.length * pricing.input * pricing.discount
    } else {
      logger.error({
        location: 'getCaps.textToSpeech',
        message: 'Cannot determine pricing for this model',
        model: model.id,
        usage: usage,
        params,
      })
      throw new ForbiddenError({
        code: 'INVALID_MODEL_PRICING',
        message: `Cannot determine pricing for this model: ${model.id}`,
      })
    }
  }
