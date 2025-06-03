import { Adapter } from '../../types'
import { PlanType } from '@prisma/client'

export type SetDefaultModel = (p: { type: PlanType; modelId: string }) => Promise<void | never>

export const buildSetDefaultModel = ({ planModelRepository }: Adapter): SetDefaultModel => {
  return async ({ type, modelId }) => {
    await planModelRepository.updateMany({
      where: {
        plan: {
          type
        },
        model_id: modelId
      },
      data: {
        is_default_model: true
      }
    })
  }
}
