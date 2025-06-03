import { ForbiddenError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { EnterpriseRole } from '@prisma/client'
import { IEnterpriseUsageConstraints } from '@/domain/entity/enterpriseUsageConstraints'

export type AddUsageConstraint = (data: {
  enterpriseId: string
  userId: string
  constraint: string
}) => Promise<IEnterpriseUsageConstraints>

export const buildAddUsageConstraint = ({ adapter }: UseCaseParams): AddUsageConstraint => {
  return async ({ enterpriseId, userId, constraint }) => {
    const employee = await adapter.employeeRepository.get({
      where: { user_id: userId, enterprise_id: enterpriseId }
    })
    if (!employee || employee.role !== EnterpriseRole.OWNER) {
      throw new ForbiddenError()
    }

    return await adapter.enterpriseUsageConstraintsRepository.create({
      data: {
        enterprise_id: enterpriseId,
        constraint
      }
    })
  }
}
