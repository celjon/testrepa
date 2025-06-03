import { PlanType } from '@prisma/client'
import { Adapter } from '../../types'
import { IPlan } from '@/domain/entity/plan'

type Params = Pick<Adapter, never>

export type HasAccessToAPI = (params: { plan: IPlan }) => Promise<{
  hasAccess: boolean
  reasonCode?: string
}>

export const buildHasAccessToAPI = (_: Params): HasAccessToAPI => {
  return async ({ plan }) => {
    if (plan.type === PlanType.FREE) {
      return {
        hasAccess: false,
        reasonCode: 'MODEL_NOT_ALLOWED_FOR_PLAN'
      }
    }

    return {
      hasAccess: true
    }
  }
}
