import { PlanType, Platform } from '@prisma/client'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { getPlatformDisabledKey, IModel, ModelFeature, ModelPlatform } from '@/domain/entity/model'
import { IPlan, IPlanModel } from '@/domain/entity/plan'
import { filterModels } from './list'
import { IModelFunction } from '@/domain/entity/modelFunction'

export type IModelCompact = {
  id: string
  label: string | null
  description: string | null
  icon: string | null
  features: ModelFeature[] | null
  functions: IModelFunction[] | null
  order: number
  used_count: number
  popularity_score: number
  disabled: boolean
  disabledWeb: boolean
  is_allowed: boolean
  allowed_plan_type: PlanType | null
  is_default: boolean
  children:
    | {
        id: string
        label: string | null
        description: string | null
        icon: string | null
        features: ModelFeature[] | null
        functions: IModelFunction[] | null
        order: number
        used_count: number
        popularity_score: number
        disabled: boolean
        disabledWeb: boolean
        is_allowed: boolean
        allowed_plan_type: PlanType | null
        is_default: boolean
      }[]
    | null
}

// Lists all parent models with their children
export type ListCompact = (params?: { userId?: string; platform?: ModelPlatform }) => Promise<Array<IModelCompact> | never>

export const buildListCompact = ({ adapter, service }: UseCaseParams): ListCompact => {
  return async ({ userId, platform } = {}) => {
    let plan: IPlan | null = null

    if (typeof userId === 'string') {
      const subscription = await service.user.getActualSubscriptionById(userId)

      if (!subscription) {
        throw new NotFoundError({
          code: 'SUBSCRIPTION_NOT_FOUND'
        })
      }

      plan = subscription?.plan ?? null
    }

    const plansModels: IPlanModel[] = await adapter.planModelRepository.list({
      where: {
        model: { disabled: false, deleted_at: null },
        deleted_at: null
      },
      orderBy: {
        plan: { price: 'asc' }
      },
      include: {
        plan: {
          select: { type: true }
        }
      }
    })

    const disabledKey = getPlatformDisabledKey(platform ?? Platform.API)

    let models: IModel[] = await adapter.modelRepository.list({
      where: {
        [disabledKey]: false,
        deleted_at: null
      },
      orderBy: [{ popularity_score: 'desc' }, { order: 'asc' }],
      select: {
        id: true,
        label: true,
        description: true,
        disabled: true,
        disabledWeb: true,
        features: true,
        order: true,
        used_count: true,
        popularity_score: true,
        icon: true,
        functions: true,
        children: {
          where: {
            [disabledKey]: false,
            deleted_at: null
          },
          orderBy: [{ popularity_score: 'desc' }, { order: 'asc' }],
          select: {
            id: true,
            label: true,
            description: true,
            disabled: true,
            disabledWeb: true,
            features: true,
            order: true,
            used_count: true,
            popularity_score: true,
            icon: true,
            functions: true
          }
        },
        providers: true
      }
    })

    models = filterModels({ models, platform, listChildren: false })

    const getModelAllowance = async (model: IModel) => {
      let isAllowed = false
      if (plan) {
        isAllowed = await service.model.isAllowed({
          plan,
          modelId: model.id
        })
      }

      let isDefault = false
      let allowedPlanType: PlanType | null = null
      const planModel = plansModels.find(({ model_id }) => model_id === model.id)

      if (isAllowed) {
        isDefault = planModel?.is_default_model ?? false
      } else {
        allowedPlanType = planModel?.plan.type ?? null
      }

      return {
        isAllowed,
        allowedPlanType,
        isDefault
      }
    }

    const compactModels = (
      await Promise.all(
        models.map(async (model) => {
          const { isAllowed, allowedPlanType, isDefault } = await getModelAllowance(model)

          return {
            id: model.id,
            label: model.label,
            description: model.description,
            icon: model.icon?.path ?? null,
            features: model.features ?? null,
            functions: model.functions ?? null,
            order: model.order,
            used_count: model.used_count,
            popularity_score: model.popularity_score,
            disabled: model.disabled,
            disabledWeb: model.disabledWeb,
            is_allowed: isAllowed,
            allowed_plan_type: allowedPlanType,
            is_default: isDefault,
            children: (
              await Promise.all(
                (model.children ?? []).map(async (child) => {
                  const { isAllowed, allowedPlanType, isDefault } = await getModelAllowance(child)

                  return {
                    id: child.id,
                    label: child.label,
                    description: child.description,
                    icon: child.icon?.path ?? null,
                    features: child.features ?? null,
                    functions: model.functions ?? null,
                    order: child.order,
                    used_count: child.used_count,
                    popularity_score: child.popularity_score,
                    disabled: child.disabled,
                    disabledWeb: child.disabledWeb,
                    is_allowed: isAllowed,
                    allowed_plan_type: allowedPlanType,
                    is_default: isDefault
                  }
                })
              )
            )
              .sort((modelA, modelB) => modelB.popularity_score - modelA.popularity_score)
              .sort((modelA, modelB) => Number(!modelA.is_allowed) - Number(!modelB.is_allowed))
          }
        })
      )
    )
      .sort((modelA, modelB) => modelB.popularity_score - modelA.popularity_score)
      .sort((modelA, modelB) => Number(!modelA.is_allowed) - Number(!modelB.is_allowed))

    return compactModels
  }
}
