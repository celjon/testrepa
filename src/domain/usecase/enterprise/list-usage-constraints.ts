import { ForbiddenError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { EnterpriseRole } from '@prisma/client'
import { IEnterpriseUsageConstraints } from '@/domain/entity/enterpriseUsageConstraints'

export type ListUsageConstraints = (data: { enterpriseId: string; userId: string }) => Promise<Array<IEnterpriseUsageConstraints>>

export const buildListUsageConstraints = ({ adapter }: UseCaseParams): ListUsageConstraints => {
  return async ({ enterpriseId, userId }) => {
    const employee = await adapter.employeeRepository.get({
      where: { user_id: userId, enterprise_id: enterpriseId }
    })
    if (!employee || employee.role !== EnterpriseRole.OWNER) {
      throw new ForbiddenError()
    }

    const constraints = await adapter.enterpriseUsageConstraintsRepository.list({
      where: {
        enterprise_id: enterpriseId
      }
    })

    return constraints
  }
}
