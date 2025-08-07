import { EnterpriseRole } from '@prisma/client'
import { UseCaseParams } from '../types'
import { ForbiddenError } from '@/domain/errors'
import { IEmployeeGroup } from '@/domain/entity/employee-group'

export type DeleteEmployeeGroups = (data: {
  employeeGroupIds: string[]
  userId: string
}) => Promise<IEmployeeGroup[]>

export const buildDeleteEmployeeGroups = ({ adapter }: UseCaseParams): DeleteEmployeeGroups => {
  return async ({ employeeGroupIds, userId }) => {
    const employee = await adapter.employeeRepository.get({
      where: { user_id: userId },
    })

    if (!employee || employee.role !== EnterpriseRole.OWNER) {
      throw new ForbiddenError()
    }
    const employeeGroups: IEmployeeGroup[] = []

    for (const id of employeeGroupIds) {
      const employeeGroup = await adapter.employeeGroupRepository.delete({ where: { id } })
      employeeGroups.push(employeeGroup)
    }

    return employeeGroups
  }
}
