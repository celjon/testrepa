import { MidjourneyMode } from '@prisma/client'
import { logger } from '@/lib/logger'
import { ForbiddenError } from '@/domain/errors'
import { IChatSettings } from '@/domain/entity/chat-settings'
import { IMessage } from '@/domain/entity/message'
import {
  IModel,
  isImageLLMModel,
  isImageModel,
  isMidjourney,
  isReplicateImageModel,
} from '@/domain/entity/model'
import {
  ImageLLMPricingParams,
  imageLLMPricingParamsSchema,
  imageLLMPricingSchema,
  ImagePricingParams,
  imagePricingParamsSchema,
  imagePricingSchema,
  mjPricingSchema,
  replicateImagePricingSchema,
  TextPricingParams,
} from '../pricing-schemas'

type Params = {}

export type GetCapsImage = (params: {
  model: IModel
  usage?: TextPricingParams | ImageLLMPricingParams
  message?: Pick<IMessage, 'mj_mode'>
  settings?: IChatSettings
  params?: unknown
}) => Promise<number>

export const buildGetCapsImage =
  (_: Params): GetCapsImage =>
  async ({ model, usage, message, settings, params }) => {
    if (isMidjourney(model) && message) {
      const pricingResult = await mjPricingSchema.safeParseAsync(model.pricing)

      if (!pricingResult.success) {
        logger.error({
          location: 'getCaps.image',
          message: 'Cannot determine pricing for this model',
          model: model.id,
          pricingResult,
        })
        throw new ForbiddenError({
          code: 'INVALID_MODEL_PRICING',
        })
      }

      const pricing = pricingResult.data
      let caps: number

      switch (message.mj_mode) {
        case MidjourneyMode.RELAX:
          caps = pricing.relax_mode
          break
        case null:
        case MidjourneyMode.FAST:
          caps = pricing.fast_mode
          break
        case MidjourneyMode.TURBO:
          caps = pricing.turbo_mode
          break
        default:
          caps = pricing.fast_mode
          break
      }
      caps *= pricing.discount

      return caps
    } else if (isReplicateImageModel(model)) {
      const pricingResult = await replicateImagePricingSchema.safeParseAsync(model.pricing)

      if (!pricingResult.success) {
        logger.error({
          location: 'getCaps.image',
          message: 'Cannot determine pricing for this model',
          model: model.id,
          pricingResult,
        })
        throw new ForbiddenError({
          code: 'INVALID_MODEL_PRICING',
        })
      }

      const replicateImageParams = settings?.replicateImage
      if (!replicateImageParams) {
        logger.error({
          location: 'getCaps.image',
          message: 'Cannot determine usage for this model',
          model: model.id,
        })
        throw new ForbiddenError({
          code: 'INVALID_PARAMS',
        })
      }

      const pricing = pricingResult.data
      let caps: number = pricing.per_image

      if (replicateImageParams.num_outputs) {
        caps = pricing.per_image * replicateImageParams.num_outputs
      }

      caps *= pricing.discount

      return caps
    } else if (isImageModel(model)) {
      if (isImageLLMModel(model)) {
        const pricingResult = await imageLLMPricingSchema.safeParseAsync(model.pricing)
        const paramsResult = await imageLLMPricingParamsSchema.safeParseAsync(usage)

        if (!pricingResult.success) {
          logger.error({
            location: 'getCaps.image',
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
            location: 'getCaps.image',
            message: 'Cannot determine usage for this model',
            model: model.id,
            params,
          })
          throw new ForbiddenError({
            code: 'INVALID_PARAMS',
          })
        }

        const { input = 1, input_image, output = 1, discount = 1 } = pricingResult.data
        const {
          input_text_tokens = 0,
          input_image_tokens = 0,
          output_image_tokens = 0,
        } = paramsResult.data

        return (
          (input_text_tokens * input +
            input_image_tokens * input_image +
            output_image_tokens * output) *
          discount
        )
      } else {
        const pricingResult = await imagePricingSchema.safeParseAsync(model.pricing)

        if (!pricingResult.success) {
          logger.error({
            location: 'getCaps.image',
            message: 'Cannot determine pricing for this model',
            model: model.id,
            pricingResult,
          })
          throw new ForbiddenError({
            code: 'INVALID_MODEL_PRICING',
          })
        }

        let imageParams: ImagePricingParams

        if (settings && settings.image) {
          imageParams = settings.image
        } else if (params) {
          const paramsResult = await imagePricingParamsSchema.safeParseAsync(params)

          if (!paramsResult.success) {
            logger.error({
              location: 'getCaps.image',
              message: 'Cannot determine usage for this model',
              model: model.id,
              params,
            })
            throw new ForbiddenError({
              code: 'INVALID_PARAMS',
              data: {
                model_id: model.id,
                pricing: model.pricing,
                params,
              },
            })
          }

          imageParams = paramsResult.data
        } else {
          logger.error({
            location: 'getCaps.image',
            message: 'Cannot determine usage for this model',
            model: model.id,
          })
          throw new ForbiddenError({
            code: 'INVALID_PARAMS',
          })
        }

        const pricing = pricingResult.data
        let caps: number

        if (imageParams.quality === 'standard') {
          if (imageParams.size === '1024x1024') {
            caps = pricing.standard['1024x1024']
          } else if (imageParams.size === '1792x1024' || imageParams.size === '1024x1792') {
            caps = pricing.standard['1792x1024']
          } else {
            caps = pricing.standard['1024x1024']
          }
        } else if (imageParams.quality === 'hd') {
          if (imageParams.size === '1024x1024') {
            caps = pricing.hd['1024x1024']
          } else if (imageParams.size === '1792x1024' || imageParams.size === '1024x1792') {
            caps = pricing.standard['1792x1024']
          } else {
            caps = pricing.hd['1024x1024']
          }
        } else {
          caps = pricing.standard['1024x1024']
        }
        caps *= pricing.discount

        return caps
      }
    } else {
      logger.error({
        location: 'getCaps.image',
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
