import { isMidjourney } from '@/domain/entity/model'
import { Adapter } from '../../types'
import { IPlan } from '@/domain/entity/plan'

export type HasAccess = (
  plan: IPlan,
  model: string,
  employeeId?: string,
) => Promise<{
  hasAccess: boolean
  reasonCode?: string
}>

export const buildHasAccess = ({ modelRepository, employeeRepository }: Adapter): HasAccess => {
  return async (plan, modelId, employeeId) => {
    const employee = await employeeRepository.get({
      where: { id: employeeId },
      include: { allowed_models: true, employee_group: { include: { allowed_models: true } } },
    })
    employeeId =
      employee?.allowed_models?.length != 0 ||
      (employee?.employee_group && employee.employee_group.allowed_models?.length !== 0)
        ? employee?.id
        : undefined

    const model = await modelRepository.get({
      where: {
        id: modelId,
        disabled: false,
      },
      include: {
        plans: {
          where: {
            plan_id: plan.id,
          },
        },
        ...(employeeId && {
          employees: {
            where: {
              employee_id: employeeId,
            },
          },
        }),
        ...(employeeId && {
          employeeGroups: {
            where: {
              employeeGroup: {
                employees: {
                  some: { id: employeeId },
                },
              },
            },
          },
        }),
      },
    })
    if (!model) {
      return {
        hasAccess: false,
        reasonCode: 'MODEL_NOT_FOUND',
      }
    }
    if (
      employeeId !== undefined &&
      model!.plans!.length > 0 &&
      (model!.employees!.length > 0 || model!.employeeGroups!.length > 0)
    ) {
      return {
        hasAccess: true,
      }
    }

    if (employeeId !== undefined && (model.parent_id || isMidjourney(model))) {
      const allowedParentModel = await modelRepository.get({
        where: {
          id: model.parent_id ? model.parent_id : model.id,
          disabled: false,
          plans: {
            some: { plan_id: plan.id },
          },
          OR: [
            {
              employees: { some: { employee_id: employeeId } },
            },
            {
              employeeGroups: {
                some: {
                  employeeGroup: {
                    employees: { some: { id: employeeId } },
                  },
                },
              },
            },
          ],
        },
      })
      if (allowedParentModel) {
        return {
          hasAccess: true,
        }
      }

      return {
        hasAccess: false,
        reasonCode: 'BLOCKED_FOR_EMPLOYEE',
      }
    }

    if (employeeId === undefined && model!.plans!.length > 0) {
      return {
        hasAccess: true,
      }
    }

    return {
      hasAccess: false,
      reasonCode: 'MODEL_NOT_ALLOWED_FOR_PLAN',
    }
  }
}
