import { IPlan } from '@/domain/entity/plan'
import { Adapter } from '../../types'
import { PlanType } from '@prisma/client'
import { isMidjourney } from '@/domain/entity/model'

export type AddModel = (p: { type: PlanType; modelId: string }) => Promise<void>

export const buildAddModel = ({
  planModelRepository,
  planRepository,
  modelRepository,
}: Adapter): AddModel => {
  return async ({ type, modelId }) => {
    const plans = await planRepository.list({
      where: {
        type,
      },
    })

    const upsertPlanModel = async (plan: IPlan, modelId: string, disabledTelegram: boolean) => {
      let [planModel] = await Promise.all([
        planModelRepository.get({
          where: {
            plan_id: plan.id,
            model_id: modelId,
          },
          include: {
            model: {
              include: {
                children: true,
              },
            },
          },
        }),
        modelRepository.update({
          where: {
            id: modelId,
          },
          data: {
            disabled: false,
            disabledWeb: false,
            disabledTelegram,
          },
        }),
      ])

      if (!planModel) {
        const newPlanModel = await planModelRepository.create({
          data: {
            plan_id: plan.id,
            model_id: modelId,
          },
          include: {
            model: {
              include: {
                children: true,
              },
            },
          },
        })

        planModel = newPlanModel
      }

      if (planModel.model.children && planModel.model.children.length > 0) {
        await Promise.all(
          planModel.model.children.map((childModel) => upsertPlanModel(plan, childModel.id, false)),
        )
      }
    }

    await Promise.all(
      plans.map((plan) => upsertPlanModel(plan, modelId, !isMidjourney({ id: modelId }))),
    )

    const planModels = await planModelRepository.list({
      where: {
        plan_id: {
          in: plans.map(({ id }) => id),
        },
        model_id: modelId,
        deleted_at: null,
      },
      include: {
        model: true,
      },
    })

    await Promise.all(
      planModels.map(async (planModel) => {
        if (!planModel || !planModel.model.parent_id) {
          return null
        }

        const planParentModel = await planModelRepository.get({
          where: {
            plan_id: planModel.plan_id,
            model_id: planModel.model.parent_id,
          },
        })

        if (!planParentModel) {
          return planModelRepository.create({
            data: {
              plan_id: planModel.plan_id,
              model_id: planModel.model.parent_id,
            },
          })
        }
      }),
    )
  }
}
