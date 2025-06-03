import { ChatSTTSettings, PlanType } from '@prisma/client'
import { ChatPlatform, IChat } from '@/domain/entity/chat'
import { ChatSettingsCustomType, IChatSettingsElement } from '@/domain/entity/chatSettings'
import { getPlatformDisabledKey } from '@/domain/entity/model'
import { IPlan, IPlanModel } from '@/domain/entity/plan'
import { NotFoundError } from '@/domain/errors'
import { Adapter } from '@/domain/types'

type Params = Adapter

export type CreateElements = (params: {
  chat: IChat
  plan: IPlan
  settings: ChatSTTSettings
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

    const STTModels = await modelRepository.list({
      where: {
        parent_id: chat.model_id,
        disabled: false,
        [disabledKey]: false
      },
      orderBy: {
        order: 'asc'
      },
      include: {
        icon: true
      }
    })

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

    const baseElement: IChatSettingsElement = {
      id: 'STT_model',
      code: 'STT_model',
      type: 'string',
      name: 'model',
      field_type: 'custom',
      custom_type: ChatSettingsCustomType.MODEL_SELECT,
      reload_on_update: true,
      value: settings.model,
      data: STTModels.map((STTModel) => {
        const isAllowed: boolean = planModels.some(({ model_id }) => model_id === STTModel.id)
        let allowedPlanType: PlanType | null = !isAllowed
          ? (plansModels.find(({ model_id }) => model_id === STTModel.id)?.plan.type ?? null)
          : null

        return {
          ...STTModel,
          is_allowed: isAllowed,
          allowed_plan_type: allowedPlanType,
          is_default: isAllowed && plansModels.some((planModel) => planModel.model_id === STTModel.id && planModel.is_default_model),
          features: STTModel.features
        }
      })
        .sort((STTModelA, STTModelB) => (STTModelA.order ?? 0) - (STTModelB.order ?? 0))
        .sort((STTModelA, STTModelB) => Number(!STTModelA.is_allowed) - Number(!STTModelB.is_allowed))
    }

    const settingsElements: IChatSettingsElement[] =
      model.id === 'whisper-1'
        ? [
            {
              id: 'STT_temperature',
              code: 'STT_temperature',
              type: 'float',
              name: 'temperature',
              field_type: 'range',
              step: 0.1,
              max: 1,
              min: 0,
              value: settings.temperature
            }
          ]
        : [
            {
              id: 'STT_format',
              code: 'STT_format',
              name: 'format',
              type: 'boolean',
              field_type: 'checkbox',
              checked: settings.format
            },
            {
              id: 'STT_speakers',
              code: 'STT_speakers',
              name: 'speakers',
              type: 'boolean',
              field_type: 'checkbox',
              checked: settings.speakers
            }
          ]

    return [baseElement, ...settingsElements]
  }
