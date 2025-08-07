import { IPlan } from '@/domain/entity/plan'

export type IsAllowed = (params: {
  plan: IPlan
  parentId?: string | null
  modelId: string
}) => Promise<boolean>

export const buildIsAllowed =
  (): IsAllowed =>
  async ({ plan, parentId, modelId }) => {
    const isAllowed: boolean = plan.models.some(
      ({ model }) =>
        !model.disabled && model.id === modelId && (!parentId || parentId === model.parent_id),
    )

    return isAllowed
  }
