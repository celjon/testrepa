import { Adapter } from '../../types'
import { IPlan } from '@/domain/entity/plan'

export type HasAccess = (
  plan: IPlan,
  model: string,
  employeeId?: string
) => Promise<{
  hasAccess: boolean
  reasonCode?: string
}>

export const buildHasAccess = ({ modelRepository }: Adapter): HasAccess => {
  return async (plan, modelId, employeeId) => {
    const model = await modelRepository.get({
      where: {
        id: modelId,
        disabled: false
      },
      include: {
        plans: {
          where: {
            plan_id: plan.id
          }
        },
        ...(employeeId && {
          employees: {
            where: {
              employee_id: employeeId
            }
          }
        })
      }
    })

    if (!model) {
      return {
        hasAccess: false,
        reasonCode: 'MODEL_NOT_FOUND'
      }
    }

    if (employeeId !== undefined && model!.plans!.length > 0 && model!.employees!.length > 0) {
      return {
        hasAccess: true
      }
    }

    if (employeeId !== undefined && model.parent_id) {
      const allowedModel = await modelRepository.get({
        where: {
          id: model.parent_id,
          employees: {
            some: {
              employee_id: employeeId
            }
          }
        }
      })

      if (allowedModel) {
        return {
          hasAccess: true
        }
      }

      return {
        hasAccess: false,
        reasonCode: 'BLOCKED_FOR_EMPLOYEE'
      }
    }

    if (employeeId === undefined && model!.plans!.length > 0) {
      return {
        hasAccess: true
      }
    }

    return {
      hasAccess: false,
      reasonCode: 'MODEL_NOT_ALLOWED_FOR_PLAN'
    }
  }
}
