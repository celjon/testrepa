import { PlanType } from '@prisma/client'
import { ChatPlatform, IChat } from '@/domain/entity/chat'
import { ChatSettingsCustomType, IChatImageSettings, IChatSettingsElement } from '@/domain/entity/chatSettings'
import { getPlatformDisabledKey } from '@/domain/entity/model'
import { IPlan, IPlanModel } from '@/domain/entity/plan'
import { NotFoundError } from '@/domain/errors'
import { Adapter } from '@/domain/types'

type Params = Adapter

export type CreateElements = (params: {
  chat: IChat
  plan: IPlan
  settings: IChatImageSettings
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

    let imageModels = await modelRepository.list({
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

    imageModels = imageModels
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
        id: 'image_size',
        code: 'image_size',
        type: 'string',
        name: 'size',
        field_type: 'select',
        value: settings.size,
        data: elements[settings.model]?.sizes
          ? elements[settings.model]?.sizes
          : [
              {
                id: '1024x1024',
                code: 'image_size_1024x1024',
                label: '1024x1024',
                value: '1024x1024'
              }
            ]
      },
      {
        id: 'image_quality',
        code: 'image_quality',
        type: 'string',
        name: 'quality',
        field_type: 'select',
        value: settings.quality,
        data: elements[settings.model]?.qualities
          ? elements[settings.model]?.qualities
          : [
              {
                id: 'standard',
                code: 'image_quality_standard',
                value: 'standard'
              }
            ]
      },
      ...(settings.model === 'dall-e-3'
        ? ([
            {
              id: 'image_style',
              code: 'image_style',
              type: 'string',
              name: 'style',
              field_type: 'select',
              value: settings.style ?? 'default',
              data: elements[settings.model]?.styles
                ? elements[settings.model]?.styles
                : [
                    {
                      id: 'default',
                      code: 'image_style_default',
                      value: 'default'
                    }
                  ]
            }
          ] as const)
        : []),
      ...([
        {
          id: 'image_model',
          code: 'model',
          type: 'string',
          name: 'model',
          field_type: 'custom',
          custom_type: ChatSettingsCustomType.MODEL_SELECT,
          reload_on_update: true,
          value: settings.model,
          data: imageModels
            .map((imageModel) => {
              const isAllowed: boolean = planModels.some(({ model_id }) => model_id === imageModel.id)

              let allowedPlanType: PlanType | null
              if (!isAllowed) {
                allowedPlanType = plansModels.find(({ model_id }) => model_id === imageModel.id)?.plan.type ?? null
              } else {
                allowedPlanType = null
              }

              return {
                ...imageModel,
                is_allowed: isAllowed,
                allowed_plan_type: allowedPlanType,
                is_default: isAllowed && plansModels.some((planModel) => planModel.model_id === imageModel.id && planModel.is_default_model)
              }
            })
            .sort((imageModelA, imageModelB) => (imageModelA.order ?? 0) - (imageModelB.order ?? 0))
            .sort((imageModelA, imageModelB) => Number(!imageModelA.is_allowed) - Number(!imageModelB.is_allowed))
        }
      ] satisfies IChatSettingsElement[])
    ]
  }

const elements = {
  ['dall-e-2' as string]: {
    sizes: [
      {
        id: '1024x1024',
        code: 'image_size_1024x1024',
        label: '1024x1024',
        value: '1024x1024'
      }
    ],
    qualities: [
      {
        id: 'standard',
        code: 'image_quality_standard',
        value: 'standard'
      }
    ],
    styles: [
      {
        id: 'default',
        code: 'image_style_default',
        value: 'default'
      }
    ]
  },

  'dall-e-3': {
    sizes: [
      {
        id: '1024x1024',
        code: 'image_size_1024x1024',
        label: '1024x1024',
        value: '1024x1024'
      },
      {
        id: '1792x1024',
        code: 'image_size_1792x1024',
        label: '1792x1024',
        value: '1792x1024'
      },
      {
        id: '1024x1792',
        code: 'image_size_1024x1792',
        label: '1024x1792',
        value: '1024x1792'
      }
    ],
    qualities: [
      {
        id: 'standard',
        code: 'image_quality_standard',
        value: 'standard'
      },
      {
        id: 'hd',
        code: 'image_quality_hd',
        value: 'hd'
      }
    ],
    styles: [
      {
        id: 'default',
        code: 'image_style_default',
        value: 'default'
      },
      {
        id: 'vivid',
        code: 'image_style_vivid',
        value: 'vivid'
      },
      {
        id: 'natural',
        code: 'image_style_natural',
        value: 'natural'
      }
    ]
  },

  'gpt-image-1': {
    sizes: [
      {
        id: '1024x1024',
        code: 'image_size_1024x1024',
        label: '1024x1024',
        value: '1024x1024'
      },
      {
        id: '1024x1536',
        code: 'image_size_1024x1536',
        label: '1024x1536',
        value: '1024x1536'
      },
      {
        id: '1536x1024',
        code: 'image_size_1536x1024',
        label: '1536x1024',
        value: '1536x1024'
      }
    ],
    qualities: [
      {
        id: 'low',
        code: 'image_quality_low',
        value: 'low'
      },
      {
        id: 'medium',
        code: 'image_quality_med',
        value: 'medium'
      },
      {
        id: 'high',
        code: 'image_quality_high',
        value: 'high'
      }
    ],
    styles: [
      {
        id: 'default',
        code: 'image_style_default',
        value: 'default'
      }
    ]
  }
}
