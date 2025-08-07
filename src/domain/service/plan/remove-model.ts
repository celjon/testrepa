import { Adapter } from '../../types'
import { PlanType } from '@prisma/client'

export type RemoveModel = (p: { type: PlanType; modelId: string }) => Promise<void>

export const buildRemoveModel = ({
  planModelRepository,
  planRepository,
  modelRepository,
}: Adapter): RemoveModel => {
  return async ({ type, modelId }) => {
    const [plans, childModels] = await Promise.all([
      planRepository.list({
        where: {
          type,
        },
      }),
      modelRepository.list({
        where: {
          parent_id: modelId,
        },
      }),
    ])

    await planModelRepository.deleteMany({
      where: {
        plan_id: {
          in: plans.map((plan) => plan.id),
        },
        model_id: {
          in: [modelId, ...childModels.map(({ id }) => id)],
        },
      },
    })
  }
}
