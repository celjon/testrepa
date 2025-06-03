import { Adapter } from '@/domain/types'
import { ChatPlatform, IChat } from '@/domain/entity/chat'
import { ChatSettingsCustomType, IChatReplicateImageSettings, IChatSettingsElement } from '@/domain/entity/chatSettings'
import {
  getPlatformDisabledKey,
  isFlux,
  isFlux11Pro,
  isFluxDev,
  isFluxPro,
  isFluxSchnell,
  isStableDiffusion,
  isStableDiffusion3
} from '@/domain/entity/model'
import { IPlan, IPlanModel, TPlanType } from '@/domain/entity/plan'
import { InvalidDataError, NotFoundError } from '@/domain/errors'
import { aspectRatios, fluxProAspectRatios } from './utils'

type Params = Adapter

export type CreateElements = (params: {
  chat: IChat
  plan: IPlan
  settings: IChatReplicateImageSettings
  platform: ChatPlatform
}) => Promise<IChatSettingsElement[]>

export const buildCreateElements = (params: Params): CreateElements => {
  const createElementsFluxPro = buildCreateElementsFluxPro(params)
  const createElementsFluxDev = buildCreateElementsFluxDev(params)
  const createElementsFluxSchnell = buildCreateElementsFluxSchnell(params)
  const createElementsFlux11Pro = buildCreateElementsFlux11Pro(params)
  const createElementsFluxDefault = buildCreateElementsFluxDefault(params)
  const createElementsSD3 = buildCreateElementsSD3(params)

  const { modelRepository } = params

  return async ({ chat, plan, settings, platform }) => {
    if (!chat.model || !chat.user) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND'
      })
    }

    let currentModel = await modelRepository.get({
      where: { id: settings.model }
    })

    if (!currentModel) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND'
      })
    }

    if (isFlux(chat.model)) {
      if (isFluxPro({ id: settings.model })) {
        return createElementsFluxPro({ chat, plan, settings, platform })
      }

      if (isFluxDev({ id: settings.model })) {
        return createElementsFluxDev({ chat, plan, settings, platform })
      }

      if (isFluxSchnell({ id: settings.model })) {
        return createElementsFluxSchnell({ chat, plan, settings, platform })
      }

      if (isFlux11Pro({ id: settings.model })) {
        return createElementsFlux11Pro({ chat, plan, settings, platform })
      }

      return createElementsFluxDefault({ chat, plan, settings, platform })
    }

    if (isStableDiffusion(chat.model)) {
      if (isStableDiffusion3({ id: settings.model })) {
        return createElementsSD3({ chat, plan, settings, platform })
      }
    }

    throw new InvalidDataError({
      code: 'MODEL_NOT_SUPPORTED'
    })
  }
}

const buildCreateElementsFluxPro = (params: Params): CreateElements => {
  const getChildModels = buildGetChildModels(params)

  return async ({ chat, plan, settings, platform }) => [
    ...(await getChildModels({ chat, plan, settings, platform })),
    ...getAspectRatioElements({ settings, aspectRatios: fluxProAspectRatios }),
    {
      id: 'replicate_image_quality',
      code: 'replicate_image_quality',
      name: 'output_quality',
      type: 'float',
      field_type: 'range',
      step: 1,
      min: 0,
      max: 100,
      value: settings.output_quality
    },
    {
      id: 'replicate_image_guidance',
      code: 'replicate_image_guidance',
      name: 'guidance',
      type: 'float',
      field_type: 'range',
      step: 0.01,
      min: 2,
      max: 5,
      value: settings.guidance
    },
    {
      id: 'replicate_image_steps',
      code: 'replicate_image_steps',
      name: 'steps',
      type: 'float',
      field_type: 'range',
      step: 1,
      min: 1,
      max: 50,
      value: settings.steps
    },
    {
      id: 'replicate_image_interval',
      code: 'replicate_image_interval',
      name: 'interval',
      type: 'float',
      field_type: 'range',
      step: 0.01,
      min: 1,
      max: 4,
      value: settings.interval
    }
  ]
}

const buildCreateElementsFluxDev = (params: Params): CreateElements => {
  const getChildModels = buildGetChildModels(params)

  return async ({ chat, plan, settings, platform }) => [
    ...(await getChildModels({ chat, plan, settings, platform })),
    ...getAspectRatioElements({ settings, aspectRatios }),
    {
      id: 'replicate_image_quality',
      code: 'replicate_image_quality',
      name: 'output_quality',
      type: 'float',
      field_type: 'range',
      step: 1,
      min: 0,
      max: 100,
      value: settings.output_quality
    },
    {
      id: 'replicate_image_guidance',
      code: 'replicate_image_guidance',
      name: 'guidance',
      type: 'float',
      field_type: 'range',
      step: 0.01,
      min: 0,
      max: 10,
      value: settings.guidance
    },
    {
      id: 'replicate_image_steps',
      code: 'replicate_image_steps',
      name: 'steps',
      type: 'float',
      field_type: 'range',
      step: 1,
      min: 1,
      max: 50,
      value: settings.steps
    },
    // { // applies only to input image
    //   id: 'replicate_image_prompt_strength',
    //   code: 'replicate_image_prompt_strength',
    //   name: 'prompt_strength',
    //   type: 'float',
    //   field_type: 'range',
    //   step: 0.01,
    //   min: 0,
    //   max: 1,
    //   value: settings.prompt_strength,
    // },
    {
      id: 'replicate_image_num_outputs',
      code: 'replicate_image_num_outputs',
      name: 'num_outputs',
      type: 'float',
      field_type: 'range',
      step: 1,
      min: 1,
      max: 4,
      value: settings.num_outputs
    }
  ]
}

const buildCreateElementsFluxSchnell = (params: Params): CreateElements => {
  const getChildModels = buildGetChildModels(params)

  return async ({ chat, plan, settings, platform }) => [
    ...(await getChildModels({ chat, plan, settings, platform })),
    ...getAspectRatioElements({ settings, aspectRatios }),
    {
      id: 'replicate_image_quality',
      code: 'replicate_image_quality',
      name: 'output_quality',
      type: 'float',
      field_type: 'range',
      step: 1,
      min: 0,
      max: 100,
      value: settings.output_quality
    },
    {
      id: 'replicate_image_num_outputs',
      code: 'replicate_image_num_outputs',
      name: 'num_outputs',
      type: 'float',
      field_type: 'range',
      step: 1,
      min: 1,
      max: 4,
      value: settings.num_outputs
    }
  ]
}

const buildCreateElementsFlux11Pro = (params: Params): CreateElements => {
  const getChildModels = buildGetChildModels(params)

  return async ({ chat, plan, settings, platform }) => [
    ...(await getChildModels({ chat, plan, settings, platform })),
    ...getAspectRatioElements({ settings, aspectRatios: fluxProAspectRatios }),
    {
      id: 'replicate_image_quality',
      code: 'replicate_image_quality',
      name: 'output_quality',
      type: 'float',
      field_type: 'range',
      step: 1,
      min: 0,
      max: 100,
      value: settings.output_quality
    }
  ]
}

const buildCreateElementsFluxDefault = (params: Params): CreateElements => {
  const getChildModels = buildGetChildModels(params)

  return async ({ chat, plan, settings, platform }) => [
    ...(await getChildModels({ chat, plan, settings, platform })),
    ...getAspectRatioElements({ settings, aspectRatios }),
    {
      id: 'replicate_image_quality',
      code: 'replicate_image_quality',
      name: 'output_quality',
      type: 'float',
      field_type: 'range',
      step: 1,
      min: 0,
      max: 100,
      value: settings.output_quality
    }
  ]
}

const buildCreateElementsSD3 = (params: Params): CreateElements => {
  const getChildModels = buildGetChildModels(params)

  return async ({ chat, plan, settings, platform }) => [
    ...(await getChildModels({ chat, plan, settings, platform })),
    ...getAspectRatioElements({ settings, aspectRatios }),
    {
      id: 'replicate_image_quality',
      code: 'replicate_image_quality',
      name: 'output_quality',
      type: 'float',
      field_type: 'range',
      step: 1,
      min: 0,
      max: 100,
      value: settings.output_quality
    },
    {
      id: 'replicate_image_guidance',
      code: 'replicate_image_guidance',
      name: 'guidance',
      type: 'float',
      field_type: 'range',
      step: 0.01,
      min: 0,
      max: 20,
      value: settings.guidance
    },
    // { // applies only to input image
    //   id: 'replicate_image_prompt_strength',
    //   code: 'replicate_image_prompt_strength',
    //   name: 'prompt_strength',
    //   type: 'float',
    //   field_type: 'range',
    //   step: 0.01,
    //   min: 0,
    //   max: 1,
    //   value: settings.prompt_strength,
    // },
    {
      id: 'replicate_image_steps',
      code: 'replicate_image_steps',
      name: 'steps',
      type: 'float',
      field_type: 'range',
      step: 1,
      min: 1,
      max: 28,
      value: settings.steps
    },
    {
      id: 'replicate_image_negative_prompt',
      code: 'replicate_image_negative_prompt',
      name: 'negative_prompt',
      type: 'string',
      field_type: 'text',
      value: settings.negative_prompt
    }
  ]
}

const getAspectRatioElements = ({
  settings,
  aspectRatios
}: {
  settings: IChatReplicateImageSettings
  aspectRatios: readonly string[]
}): IChatSettingsElement[] => {
  return [
    {
      id: 'replicate_image_aspect',
      code: 'replicate_image_aspect',
      name: 'aspect_ratio',
      type: 'string',
      field_type: 'select',
      value: settings.aspect_ratio,
      data: aspectRatios.map((aspectRatio) => ({
        id: aspectRatio,
        code: `replicate_image_aspect_${aspectRatio.replace(/:/g, '_')}`,
        value: aspectRatio
      }))
    }
  ] as const
}

const buildGetChildModels = ({ modelRepository, planModelRepository }: Params): CreateElements => {
  return async ({ chat, plan, settings, platform }) => {
    const disabledKey = getPlatformDisabledKey(platform)
    let childModels = await modelRepository.list({
      where: {
        parent_id: chat.model_id,
        disabled: false,
        [disabledKey]: false
      },
      orderBy: {
        order: 'asc'
      },
      include: {
        icon: true,
        providers: true
      }
    })

    childModels = childModels
      .filter((model) => (model.providers?.length ? model.providers.some((provider) => !provider.disabled) : true))
      .map(({ providers: _, ...model }) => model)

    const currentPlanModels: IPlanModel[] = plan.models

    const allPlanModels = await planModelRepository.list({
      where: {
        model: {
          disabled: false
        }
      },
      orderBy: {
        plan: {
          price: 'asc'
        }
      },
      include: {
        plan: {
          select: {
            type: true
          }
        }
      }
    })

    return [
      {
        id: 'replicate_image_model',
        code: 'model',
        name: 'model',
        type: 'string',
        field_type: 'custom',
        custom_type: ChatSettingsCustomType.MODEL_SELECT,
        reload_on_update: true,
        value: settings.model,
        data: childModels
          .map((imageModel) => {
            const isAllowed: boolean = currentPlanModels.some(({ model_id }) => model_id === imageModel.id)

            let allowedPlanType: TPlanType | null
            if (!isAllowed) {
              allowedPlanType = allPlanModels.find(({ model_id }) => model_id === imageModel.id)?.plan.type ?? null
            } else {
              allowedPlanType = null
            }

            return {
              ...imageModel,
              is_allowed: isAllowed,
              allowed_plan_type: allowedPlanType,
              is_default: isAllowed && allPlanModels.some((planModel) => planModel.model_id === imageModel.id && planModel.is_default_model)
            }
          })
          .sort((imageModelA, imageModelB) => (imageModelA.order ?? 0) - (imageModelB.order ?? 0))
          .sort((imageModelA, imageModelB) => Number(!imageModelA.is_allowed) - Number(!imageModelB.is_allowed))
      }
    ]
  }
}
