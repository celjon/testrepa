import { EnterpriseRole } from '@prisma/client'
import { UseCaseParams } from '../types'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { IEmployeeGroup } from '@/domain/entity/employee-group'

export type UpdateEmployeeGroups = (data: {
  groups: {
    employeeGroupId: string
    label: string
    spend_limit_on_month?: number
    userIds: string[]
    modelIds: string[]
  }[]
  userId: string
}) => Promise<IEmployeeGroup[]>

export const buildUpdateEmployeeGroups = ({ adapter }: UseCaseParams): UpdateEmployeeGroups => {
  return async ({ groups, userId }) => {
    const employee = await adapter.employeeRepository.get({
      where: { user_id: userId },
    })

    if (!employee || employee.role !== EnterpriseRole.OWNER) {
      throw new ForbiddenError()
    }

    const employeeGroups: IEmployeeGroup[] = []
    for (const group of groups) {
      const { employeeGroupId, userIds, label, spend_limit_on_month, modelIds } = group
      let employeeGroup = await adapter.employeeGroupRepository.get({
        where: { id: employeeGroupId },
      })

      if (!employeeGroup) {
        throw new NotFoundError({
          code: 'GROUP_EMPLOYEE_NOT_FOUND',
        })
      }

      const employees = await adapter.employeeRepository.list({
        where: { user_id: { in: userIds } },
      })

      employeeGroup = await adapter.employeeGroupRepository.update({
        where: { id: employeeGroupId },
        data: {
          label,
          ...(spend_limit_on_month !== undefined && {
            spend_limit_on_month: BigInt(spend_limit_on_month),
          }),
          allowed_models: {
            deleteMany: {},
            create: modelIds.map((modelId) => ({ model_id: modelId })),
          },
          employees: {
            set: employees.map((employee) => ({ id: employee.id })),
          },
        },
        include: {
          employees: true,
          allowed_models: true,
        },
      })

      employeeGroups.push(employeeGroup)
    }

    return employeeGroups
  }
}
