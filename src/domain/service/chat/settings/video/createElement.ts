import { PlanType } from '@prisma/client'
import { ChatPlatform, IChat } from '@/domain/entity/chat'
import { ChatSettingsCustomType, IChatSettingsElement, IChatVideoSettings } from '@/domain/entity/chatSettings'
import { getPlatformDisabledKey, isReplicateVideoModel } from '@/domain/entity/model'
import { IPlan, IPlanModel } from '@/domain/entity/plan'
import { NotFoundError } from '@/domain/errors'
import { Adapter } from '@/domain/types'

type Params = Adapter

export type CreateElements = (params: {
  chat: IChat
  plan: IPlan
  settings: IChatVideoSettings
  platform: ChatPlatform
}) => Promise<IChatSettingsElement[]>

export const buildCreateElements =
  ({ modelRepository, planModelRepository }: Params): CreateElements =>
  async ({ chat, plan, settings, platform }) => {
    if (!chat.model || !chat.user) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND'
      })
    }

    let model = await modelRepository.get({
      where: {
        id: settings.model
      }
    })

    const planModels: IPlanModel[] = plan.models
    const disabledKey = getPlatformDisabledKey(platform)

    let videoModels = await modelRepository.list({
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

    videoModels = videoModels
      .filter((model) => (model.providers?.length ? model.providers.some((provider) => !provider.disabled) : true))
      .map(({ providers: _, ...model }) => model)

    const plansModels: IPlanModel[] = await planModelRepository.list({
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

    if (!model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND'
      })
    }

    const videoModelElement: IChatSettingsElement = {
      id: 'video_model',
      code: 'model',
      name: 'model',
      type: 'string',
      field_type: 'custom',
      custom_type: ChatSettingsCustomType.MODEL_SELECT,
      reload_on_update: true,
      value: settings.model,
      data: videoModels
        .map((videoModel) => {
          const isAllowed = planModels.some(({ model_id }) => model_id === videoModel.id)

          let allowedPlanType: PlanType | null
          if (!isAllowed) {
            allowedPlanType = plansModels.find(({ model_id }) => model_id === videoModel.id)?.plan.type ?? null
          } else {
            allowedPlanType = null
          }

          return {
            ...videoModel,
            is_allowed: isAllowed,
            allowed_plan_type: allowedPlanType,
            is_default: isAllowed && plansModels.some((planModel) => planModel.model_id === videoModel.id && planModel.is_default_model)
          }
        })
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .sort((a, b) => Number(!a.is_allowed) - Number(!b.is_allowed))
    }

    return [
      isReplicateVideoModel(model) ? getVeoDurationElement(settings) : getRunwayDurationElement(settings),
      isReplicateVideoModel(model) ? getVeoAspectElements() : getRunwayAspectElements(model.id),
      videoModelElement
    ]
  }

const getRunwayAspectElements = (model_id: string): IChatSettingsElement => {
  return {
    id: 'video_aspect_ratio',
    code: 'video_aspect_ratio',
    type: 'string',
    name: 'aspect_ratio',
    field_type: 'select',
    value: RUNWAY_ASPECT_RATIOS[model_id][0],
    data: RUNWAY_ASPECT_RATIOS[model_id].map((aspectRatio) => ({
      id: aspectRatio,
      code: `runway_aspect_ratio_${aspectRatio.replace(/:/g, '_')}`,
      value: aspectRatio,
      label: aspectRatio
    }))
  }
}

const getVeoAspectElements = (): IChatSettingsElement => {
  return {
    id: 'video_aspect_ratio',
    code: 'video_aspect_ratio',
    type: 'string',
    name: 'aspect_ratio',
    field_type: 'select',
    value: '16:9',
    data: [
      {
        id: '16:9',
        code: 'video_aspect_ratio_16_9',
        label: '16:9',
        value: '16:9'
      },
      {
        id: '9:16',
        code: 'video_aspect_ratio_9_16',
        label: '9:16',
        value: '9:16'
      }
    ]
  }
}

const getVeoDurationElement = (settings: IChatVideoSettings): IChatSettingsElement => {
  return {
    id: 'video_duration',
    code: 'video_duration',
    type: 'float',
    name: 'duration_seconds',
    step: 1,
    min: 5,
    max: 8,
    field_type: 'range',
    value: settings.duration_seconds
  }
}

const getRunwayDurationElement = (settings: IChatVideoSettings): IChatSettingsElement => {
  return {
    id: 'video_duration',
    code: 'video_duration',
    type: 'string',
    field_type: 'select',
    name: 'duration_seconds',
    data: [
      {
        id: '5',
        code: 'duration_5',
        label: '5',
        value: '5'
      },
      {
        id: '10',
        code: 'duration_10',
        label: '10',
        value: '10'
      }
    ],
    value: `${settings.duration_seconds}`
  }
}

export const RUNWAY_ASPECT_RATIOS: Record<string, string[]> = {
  gen4_turbo: ['1280:720', '720:1280', '1104:832', '832:1104', '960:960', '1584:672'],
  gen3a_turbo: ['1280:768', '768:1280']
}
