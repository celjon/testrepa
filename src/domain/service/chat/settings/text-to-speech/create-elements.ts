import { PlanType } from '@prisma/client'
import { ChatPlatform, IChat } from '@/domain/entity/chat'
import {
  ChatSettingsCustomType,
  IChatSettingsElement,
  IChatSpeechSettings,
} from '@/domain/entity/chat-settings'
import { getPlatformDisabledKey } from '@/domain/entity/model'
import { IPlan, IPlanModel } from '@/domain/entity/plan'
import { NotFoundError } from '@/domain/errors'
import { ModelService } from '@/domain/service/model'
import { Adapter } from '@/domain/types'

type Params = Adapter & {
  modelService: ModelService
}

export type CreateElements = (params: {
  chat: IChat
  plan: IPlan
  settings: IChatSpeechSettings
  platform: ChatPlatform
}) => Promise<IChatSettingsElement[]>

export const buildCreateElements =
  ({ modelRepository, planModelRepository }: Params): CreateElements =>
  async ({ chat, plan, settings, platform }) => {
    if (!chat.model || !chat.user) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND',
      })
    }

    let model = await modelRepository.get({
      where: {
        id: settings.model,
      },
    })

    const planModels: IPlanModel[] = plan.models
    const disabledKey = getPlatformDisabledKey(platform)

    const speechModels = await modelRepository.list({
      where: {
        parent_id: chat.model_id,
        disabled: false,
        [disabledKey]: false,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        icon: true,
      },
    })

    const plansModels: IPlanModel[] = await planModelRepository.list({
      where: {
        model: {
          disabled: false,
        },
      },
      orderBy: {
        plan: {
          price: 'asc',
        },
      },
      include: {
        plan: {
          select: {
            type: true,
          },
        },
      },
    })

    if (!model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND',
      })
    }

    return [
      {
        id: 'speech_model',
        code: 'speech_model',
        type: 'string',
        name: 'model',
        field_type: 'custom',
        custom_type: ChatSettingsCustomType.MODEL_SELECT,
        reload_on_update: true,
        value: settings.model,
        data: speechModels
          .map((speechModel) => {
            const isAllowed: boolean = planModels.some(
              ({ model_id }) => model_id === speechModel.id,
            )

            let allowedPlanType: PlanType | null
            if (!isAllowed) {
              allowedPlanType =
                plansModels.find(({ model_id }) => model_id === speechModel.id)?.plan.type ?? null
            } else {
              allowedPlanType = null
            }

            return {
              ...speechModel,
              is_allowed: isAllowed,
              allowed_plan_type: allowedPlanType,
              is_default:
                isAllowed &&
                plansModels.some(
                  (planModel) =>
                    planModel.model_id === speechModel.id && planModel.is_default_model,
                ),
              features: speechModel.features,
            }
          })
          .sort(
            (speechModelA, speechModelB) => (speechModelA.order ?? 0) - (speechModelB.order ?? 0),
          )
          .sort(
            (speechModelA, speechModelB) =>
              Number(!speechModelA.is_allowed) - Number(!speechModelB.is_allowed),
          ),
      },
      {
        id: 'speech_voice',
        code: 'speech_voice',
        type: 'string',
        field_type: 'select',
        name: 'voice',
        reload_on_update: true,
        data: [
          {
            id: 'fable',
            code: 'speech_voice_fable',
            value: 'fable',
          },
          {
            id: 'alloy',
            code: 'speech_voice_alloy',
            value: 'alloy',
          },
          {
            id: 'onyx',
            code: 'speech_voice_onyx',
            value: 'onyx',
          },
          {
            id: 'nova',
            code: 'speech_voice_nova',
            value: 'nova',
          },
          {
            id: 'shimmer',
            code: 'speech_voice_shimmer',
            value: 'shimmer',
          },
          {
            id: 'echo',
            code: 'speech_voice_echo',
            value: 'echo',
          },
        ],
        value: settings.voice,
      },
      {
        id: 'speech_speed',
        code: 'speech_speed',
        type: 'float',
        name: 'speed',
        field_type: 'range',
        step: 0.25,
        max: 4,
        min: 0.25,
        reload_on_update: true,
        value: settings.speed,
      },
    ]
  }
