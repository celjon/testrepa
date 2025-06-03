import { IModel } from '@/domain/entity/model'
import { IPlan } from '@/domain/entity/plan'

export type GetDefault = (params: { plan: IPlan; parentId?: string | null }) => Promise<IModel | null>

export const buildGetDefault =
  (): GetDefault =>
  async ({ plan, parentId = null }) => {
    let defaultModel =
      plan.models.find(
        ({ model, is_default_model }) => !model.disabled && !model.disabledWeb && model.parent_id === parentId && is_default_model
      ) ?? null

    if (!defaultModel) {
      defaultModel = plan.models.find(({ model }) => !model.disabled && !model.disabledWeb && model.parent_id === parentId) ?? null
    }

    return defaultModel?.model ?? null
  }
