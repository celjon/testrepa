import { MidjourneyMode } from '@prisma/client'
import { logger } from '@/lib/logger'
import { ForbiddenError } from '@/domain/errors'
import { IChatSettings } from '@/domain/entity/chatSettings'
import { IMessage } from '@/domain/entity/message'
import {
  IModel,
  isAudioModel,
  isEmbeddings,
  isImageLLMModel,
  isImageModel,
  isMidjourney,
  isReplicateImageModel,
  isSpeechModel,
  isTextModel,
  isVideoModel
} from '@/domain/entity/model'
import {
  audioPricingSchema,
  embeddingsPricingParamsSchema,
  embeddingsPricingSchema,
  imageLLMPricingSchema,
  ImagePricingParams,
  imagePricingParamsSchema,
  imagePricingSchema,
  mjPricingSchema,
  ReplicateImagePricingParams,
  replicateImageParamsSchema,
  replicateImagePricingSchema,
  speechPricingParamsSchema,
  speechPricingSchema,
  textPricingSchema,
  textPricingParamsSchema,
  imageLLMPricingParamsSchema,
  ImageLLMPricingParams,
  TextPricingParams,
  replicateVideoPricingSchema
} from './pricing-schemas'

type Params = {}

export type GetCaps = (params: {
  model: IModel
  usage?: TextPricingParams | ImageLLMPricingParams
  message?: Pick<IMessage, 'mj_mode'>
  settings?: IChatSettings
  params?: unknown
  audioMetadata?: {
    duration?: number
  }
}) => Promise<number>

export const buildGetCaps =
  (_: Params): GetCaps =>
  async ({ model, usage, message, settings, params, audioMetadata }) => {
    if (isTextModel(model) && usage) {
      const pricingResult = await textPricingSchema.safeParseAsync(model.pricing)

      if (!pricingResult.success) {
        throw new ForbiddenError({
          code: 'INVALID_MODEL_PRICING'
        })
      }

      const paramsResult = await textPricingParamsSchema.safeParseAsync(usage)

      if (!paramsResult.success) {
        throw new ForbiddenError({
          code: 'INVALID_MODEL_PRICING',
          message: 'No valid usage data provided'
        })
      }

      const { input = 1, output = 1, discount = 1 } = pricingResult.data
      const { prompt_tokens = 0, completion_tokens = 0 } = paramsResult.data

      return (prompt_tokens * input + completion_tokens * output) * discount
    } else if (isMidjourney(model) && message) {
      const pricingResult = await mjPricingSchema.safeParseAsync(model.pricing)

      if (!pricingResult.success) {
        throw new ForbiddenError({
          code: 'INVALID_MODEL_PRICING'
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
        throw new ForbiddenError({
          code: 'INVALID_MODEL_PRICING'
        })
      }

      const pricing = pricingResult.data
      let replicateImageParams: ReplicateImagePricingParams

      if (settings && settings.replicateImage) {
        replicateImageParams = settings.replicateImage
      } else if (params) {
        const paramsResult = await replicateImageParamsSchema.safeParseAsync(params)

        if (!paramsResult.success) {
          throw new ForbiddenError({
            code: 'INVALID_MODEL_PRICING'
          })
        }

        replicateImageParams = paramsResult.data
      } else {
        throw new ForbiddenError({
          code: 'INVALID_PARAMS'
        })
      }

      let caps: number = pricing.per_image

      if (replicateImageParams.num_outputs) {
        caps = pricing.per_image * replicateImageParams.num_outputs
      }

      caps *= pricing.discount

      return caps
    } else if (isVideoModel(model) && settings?.video?.duration_seconds) {
      const pricingResult = await replicateVideoPricingSchema.safeParseAsync(model.pricing)
      if (!pricingResult.success) {
        throw new ForbiddenError({
          code: 'INVALID_MODEL_PRICING'
        })
      }
      const pricing = pricingResult.data
      return settings.video.duration_seconds * pricing.per_second * pricing.discount
    } else if (isImageModel(model)) {
      if (isImageLLMModel(model)) {
        const pricingResult = await imageLLMPricingSchema.safeParseAsync(model.pricing)

        if (!pricingResult.success) {
          throw new ForbiddenError({
            code: 'INVALID_MODEL_PRICING'
          })
        }

        const paramsResult = await imageLLMPricingParamsSchema.safeParseAsync(usage)

        if (!paramsResult.success) {
          throw new ForbiddenError({
            code: 'INVALID_MODEL_PRICING',
            message: 'No valid usage data provided'
          })
        }

        const { input = 1, input_image, output = 1, discount = 1 } = pricingResult.data
        const { input_text_tokens = 0, input_image_tokens = 0, output_image_tokens = 0 } = paramsResult.data

        return (input_text_tokens * input + input_image_tokens * input_image + output_image_tokens * output) * discount
      } else {
        const pricingResult = await imagePricingSchema.safeParseAsync(model.pricing)

        if (!pricingResult.success) {
          throw new ForbiddenError({
            code: 'INVALID_MODEL_PRICING'
          })
        }

        const pricing = pricingResult.data
        let imageParams: ImagePricingParams

        if (settings && settings.image) {
          imageParams = settings.image
        } else if (params) {
          const paramsResult = await imagePricingParamsSchema.safeParseAsync(params)

          if (!paramsResult.success) {
            throw new ForbiddenError({
              code: 'INVALID_MODEL_PRICING'
            })
          }

          imageParams = paramsResult.data
        } else {
          throw new ForbiddenError({
            code: 'INVALID_PARAMS'
          })
        }

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
    } else if (isAudioModel(model) && audioMetadata && audioMetadata.duration) {
      const pricingResult = await audioPricingSchema.safeParseAsync(model.pricing)

      if (!pricingResult.success) {
        throw new ForbiddenError({
          code: 'INVALID_MODEL_PRICING'
        })
      }

      const pricing = pricingResult.data

      return (audioMetadata.duration / 60) * pricing.input * pricing.discount
    } else if (isEmbeddings(model) && params) {
      const [pricingResult, paramsResult] = await Promise.all([
        embeddingsPricingSchema.safeParseAsync(model.pricing),
        embeddingsPricingParamsSchema.safeParseAsync(params)
      ])

      if (!pricingResult.success) {
        throw new ForbiddenError({
          code: 'INVALID_MODEL_PRICING'
        })
      }
      if (!paramsResult.data) {
        throw new ForbiddenError({
          code: 'INVALID_PARAMS'
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
    } else if (isSpeechModel(model) && params) {
      const [pricingResult, paramsResult] = await Promise.all([
        speechPricingSchema.safeParseAsync(model.pricing),
        speechPricingParamsSchema.safeParseAsync(params)
      ])

      if (!pricingResult.success) {
        throw new ForbiddenError({
          code: 'INVALID_MODEL_PRICING'
        })
      }
      if (!paramsResult.success) {
        throw new ForbiddenError({
          code: 'INVALID_PARAMS'
        })
      }

      const pricing = pricingResult.data
      const { input } = paramsResult.data

      return input.length * pricing.input * pricing.discount
    } else {
      logger.error({
        location: 'getCaps',
        message: 'Cannot determine pricing for this model',
        model: model.id,
        usage: usage,
        params
      })
      throw new ForbiddenError({
        code: 'INVALID_MODEL_PRICING',
        message: 'Cannot determine pricing for this model'
      })
    }
  }
