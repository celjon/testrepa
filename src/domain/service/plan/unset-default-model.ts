import { Adapter } from '../../types'
import { PlanType } from '@prisma/client'

export type UnsetDefaultModel = (p: { type: PlanType; modelId: string }) => Promise<void>

export const buildUnsetDefaultModel = ({
  planModelRepository,
  planRepository,
}: Adapter): UnsetDefaultModel => {
  return async ({ type, modelId }) => {
    const plans = await planRepository.list({
      where: {
        type,
      },
    })

    await planModelRepository.updateMany({
      where: {
        plan_id: {
          in: plans.map((plan) => plan.id),
        },
        model_id: modelId,
      },
      data: {
        is_default_model: false,
      },
    })
  }
}
