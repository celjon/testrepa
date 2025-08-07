import { PlanType, Platform } from '@prisma/client'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { getPlatformDisabledKey, IModel, isMidjourney, ModelPlatform } from '@/domain/entity/model'
import { IPlan, IPlanModel } from '@/domain/entity/plan'

export type List = (params?: {
  userId?: string
  parentId?: string | null
  platform?: ModelPlatform
  listChildren?: boolean
}) => Promise<Array<IModel> | never>

export const buildList = ({ adapter, service }: UseCaseParams): List => {
  return async ({ userId, parentId, platform, listChildren = false } = {}) => {
    let plan: IPlan | null = null

    if (typeof userId === 'string') {
      const subscription = await service.user.getActualSubscriptionById(userId)

      if (!subscription) {
        throw new NotFoundError({
          code: 'SUBSCRIPTION_NOT_FOUND',
        })
      }

      plan = subscription?.plan ?? null
    }

    const plansModels: IPlanModel[] = await adapter.planModelRepository.list({
      where: {
        model: { disabled: false, deleted_at: null },
        deleted_at: null,
      },
      orderBy: {
        plan: { price: 'asc' },
      },
      include: {
        plan: {
          select: { type: true },
        },
      },
    })

    const disabledKey = getPlatformDisabledKey(platform ?? Platform.API)

    let models: IModel[] = await adapter.modelRepository.list({
      where:
        platform === Platform.TELEGRAM
          ? { [disabledKey]: false, deleted_at: null }
          : {
              parent_id: parentId,
              ...(listChildren &&
                !parentId && {
                  parent_id: { not: null },
                }),
              [disabledKey]: false,
              deleted_at: null,
            },
      orderBy: listChildren
        ? [{ parent: { popularity_score: 'desc' } }, { parent: { order: 'asc' } }]
        : [{ popularity_score: 'desc' }, { order: 'asc' }],
      include: {
        icon: true,
        parent: {
          select: {
            order: true,
            label: true,
            used_count: true,
            popularity_score: true,
          },
        },
        functions: true,
        ...(!listChildren && {
          children: {
            where: {
              [disabledKey]: false,
              deleted_at: null,
            },
            orderBy: [{ popularity_score: 'desc' }, { order: 'asc' }],
            select: {
              id: true,
              features: true,
              used_count: true,
              popularity_score: true,
            },
          },
        }),
        providers: true,
      },
    })

    models = filterModels({ models, platform, listChildren })

    models = (
      await Promise.all(
        models.map(async (model) => {
          let isAllowed = false
          if (plan) {
            isAllowed = await service.model.isAllowed({
              plan,
              modelId: model.id,
            })
          }

          let allowedPlanType: PlanType | null = null
          if (!isAllowed) {
            allowedPlanType =
              plansModels.find(({ model_id }) => model_id === model.id)?.plan.type ?? null
          }

          return {
            ...model,
            is_allowed: isAllowed,
            allowed_plan_type: allowedPlanType,
            is_default:
              isAllowed &&
              plansModels.some(
                (planModel) => planModel.model_id === model.id && planModel.is_default_model,
              ),
            ...(model.parent && {
              parent: {
                ...model.parent,
                is_default:
                  isAllowed &&
                  plansModels.some(
                    (planModel) =>
                      planModel.model_id === model.parent_id && planModel.is_default_model,
                  ),
              },
            }),
          }
        }),
      )
    )
      .sort((modelA, modelB) => modelB.popularity_score - modelA.popularity_score)
      .sort((modelA, modelB) => {
        if (!modelB.parent || !modelA.parent) {
          return 0
        }

        return modelB.parent.popularity_score - modelA.parent.popularity_score
      })
      .sort((modelA, modelB) => Number(!modelA.is_allowed) - Number(!modelB.is_allowed))

    return models
  }
}

export const filterModels = ({
  models,
  platform,
  listChildren,
}: {
  models: IModel[]
  platform?: ModelPlatform
  listChildren?: boolean
}) => {
  // hide models with disabled providers
  models = models
    .filter((model) => {
      if (model.providers?.length) {
        return model.providers.some((provider) => !provider.disabled)
      }
      return true
    })
    .map(({ providers: _, ...model }) => ({
      ...model,
      children: model.children
        ?.filter((child) => {
          if (child.providers?.length) {
            return child.providers.some((provider) => !provider.disabled)
          }
          return true
        })
        .map(({ providers: _, ...child }) => child),
    }))

  if (platform === Platform.WEB && !listChildren) {
    // allow midjourney and valid parent models only
    models = models.filter(
      (model) => isMidjourney(model) || (model.children && model.children.length > 0),
    )
  }

  return models
}
