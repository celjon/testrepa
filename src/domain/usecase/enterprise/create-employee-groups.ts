import { EnterpriseRole } from '@prisma/client'
import { UseCaseParams } from '../types'
import { ForbiddenError } from '@/domain/errors'
import { IEmployeeGroup } from '@/domain/entity/employee-group'

export type CreateEmployeeGroups = (data: {
  groups: {
    label: string
    spend_limit_on_month: number
    userIds: string[]
    modelIds: string[]
  }[]
  userId: string
}) => Promise<IEmployeeGroup[]>

export const buildCreateEmployeeGroups = ({ adapter }: UseCaseParams): CreateEmployeeGroups => {
  return async ({ groups, userId }) => {
    const employee = await adapter.employeeRepository.get({
      where: { user_id: userId },
    })

    if (!employee || employee.role !== EnterpriseRole.OWNER) {
      throw new ForbiddenError()
    }

    const employeeGroups: IEmployeeGroup[] = []

    for (const group of groups) {
      const { userIds, label, spend_limit_on_month, modelIds } = group

      const employees = await adapter.employeeRepository.list({
        where: { user_id: { in: userIds } },
      })
      const employeeGroup = await adapter.employeeGroupRepository.create({
        data: {
          label,
          spend_limit_on_month: BigInt(spend_limit_on_month),
          enterprise_id: employee.enterprise_id,
          allowed_models: {
            create: modelIds.map((modelId) => ({ model_id: modelId })),
          },
          employees: {
            connect: employees.map((employee) => ({ id: employee.id })),
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
