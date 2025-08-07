import { logger } from '@/lib/logger'
import { ForbiddenError } from '@/domain/errors'
import { IModel, isEmbeddings } from '@/domain/entity/model'
import { embeddingsPricingParamsSchema, embeddingsPricingSchema } from '../pricing-schemas'

type Params = {}

export type GetCapsEmbeddings = (params: { model: IModel; params?: unknown }) => Promise<number>

export const buildGetCapsEmbeddings =
  (_: Params): GetCapsEmbeddings =>
  async ({ model, params }) => {
    if (isEmbeddings(model) && params) {
      const [pricingResult, paramsResult] = await Promise.all([
        embeddingsPricingSchema.safeParseAsync(model.pricing),
        embeddingsPricingParamsSchema.safeParseAsync(params),
      ])

      if (!pricingResult.success) {
        logger.error({
          location: 'getCaps.embeddings',
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
          location: 'getCaps.embeddings',
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

      let inputLength = 1
      if (typeof input === 'string') {
        inputLength = input.length
      } else if (Array.isArray(input)) {
        inputLength = input.reduce((acc: number, item) => {
          if (typeof item === 'string') {
            return acc + item.length
          }
          if (typeof item === 'number') {
            return acc + 1
          }
          if (Array.isArray(item)) {
            return acc + item.length
          }
          return acc + 1
        }, 0)
      }

      return inputLength * pricing.input * pricing.discount
    } else {
      logger.error({
        location: 'getCaps.embeddings',
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
