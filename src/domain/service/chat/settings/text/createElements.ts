import { PlanType } from '@prisma/client'
import { ChatPlatform, IChat } from '@/domain/entity/chat'
import { ChatSettingsCustomType, IChatSettingsElement, IChatTextSettings } from '@/domain/entity/chatSettings'
import { getPlatformDisabledKey } from '@/domain/entity/model'
import { IPlan, IPlanModel } from '@/domain/entity/plan'
import { NotFoundError } from '@/domain/errors'
import { Adapter } from '@/domain/types'

type Params = Adapter

export type CreateElements = (params: {
  chat: IChat
  plan: IPlan
  settings: IChatTextSettings
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

    let textModels = await modelRepository.list({
      where: {
        parent_id: chat.model_id,
        disabled: false,
        [disabledKey]: false
      },
      orderBy: {
        popularity_score: 'desc'
      },
      include: {
        icon: true,
        providers: true
      }
    })

    textModels = textModels
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

    return [
      {
        id: 'text_preset',
        code: 'preset',
        type: 'string',
        name: 'preset_id',
        field_type: 'custom',
        custom_type: ChatSettingsCustomType.PRESET_SELECT,
        value: settings.preset_id,
        reload_on_update: true,
        data: {
          preset: settings.preset ?? null
        }
      },
      {
        id: 'text_system_prompt',
        code: 'text_system_prompt',
        type: 'string',
        name: 'system_prompt',
        field_type: 'textarea',
        value: settings.system_prompt
      },
      {
        id: 'text_files',
        code: 'files',
        type: 'array',
        name: 'files',
        field_type: 'custom',
        custom_type: ChatSettingsCustomType.FILES,
        value: settings.files ?? []
      },
      ...([
        {
          id: 'text_model',
          code: 'model',
          type: 'string',
          name: 'model',
          field_type: 'custom',
          custom_type: ChatSettingsCustomType.MODEL_SELECT,
          reload_on_update: true,
          value: settings.model,
          data: textModels
            .map((textModel) => {
              const isAllowed: boolean = planModels.some(({ model_id }) => model_id === textModel.id)

              let allowedPlanType: PlanType | null
              if (!isAllowed) {
                allowedPlanType = plansModels.find(({ model_id }) => model_id === textModel.id)?.plan.type ?? null
              } else {
                allowedPlanType = null
              }

              return {
                ...textModel,
                is_allowed: isAllowed,
                allowed_plan_type: allowedPlanType,
                is_default: isAllowed && plansModels.some((planModel) => planModel.model_id === textModel.id && planModel.is_default_model)
              }
            })
            .sort((textModelA, textModelB) => Number(!textModelA.is_allowed) - Number(!textModelB.is_allowed))
        }
      ] satisfies IChatSettingsElement[]),
      {
        id: 'text_temperature',
        code: 'text_temperature',
        type: 'float',
        name: 'temperature',
        field_type: 'range',
        step: 0.1,
        max: 2,
        min: 0,
        value: settings.temperature
      },
      {
        id: 'text_max_tokens',
        code: 'text_max_tokens',
        type: 'float',
        name: 'max_tokens',
        field_type: 'range',
        step: 1,
        max: model.max_tokens,
        min: 0,
        value: settings.max_tokens
      },
      {
        id: 'text_include_context',
        code: 'text_include_context',
        type: 'boolean',
        name: 'include_context',
        field_type: 'checkbox',
        checked: settings.include_context
      },
      {
        id: 'text_top_p',
        code: 'text_top_p',
        type: 'float',
        name: 'top_p',
        field_type: 'range',
        step: 0.1,
        max: 1,
        min: 0,
        value: settings.top_p
      },
      {
        id: 'text_presence_penalty',
        code: 'text_presence_penalty',
        type: 'float',
        name: 'presence_penalty',
        field_type: 'range',
        step: 0.1,
        max: 2,
        min: -2,
        value: settings.presence_penalty
      },
      {
        id: 'text_frequency_penalty',
        code: 'text_frequency_penalty',
        type: 'float',
        name: 'frequency_penalty',
        field_type: 'range',
        step: 0.1,
        max: 2,
        min: -2,
        value: settings.frequency_penalty
      },
      {
        id: 'text_analyze_urls',
        code: 'text_analyze_urls',
        type: 'boolean',
        name: 'analyze_urls',
        field_type: 'checkbox',
        checked: settings.analyze_urls
      },
      {
        id: 'text_enable_web_search',
        code: 'text_enable_web_search',
        type: 'boolean',
        name: 'enable_web_search',
        field_type: 'checkbox',
        checked: settings.enable_web_search
      }
    ]
  }
