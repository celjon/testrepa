import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { EnterpriseRole } from '@prisma/client'
import { IEnterpriseUsageConstraints } from '@/domain/entity/enterprise-usage-constraints'

export type RemoveUsageConstraint = (data: {
  enterpriseId: string
  userId: string
  constraintId: string
}) => Promise<IEnterpriseUsageConstraints>

export const buildRemoveUsageConstraint = ({ adapter }: UseCaseParams): RemoveUsageConstraint => {
  return async ({ enterpriseId, userId, constraintId }) => {
    const employee = await adapter.employeeRepository.get({
      where: { user_id: userId, enterprise_id: enterpriseId },
    })
    if (!employee || employee.role !== EnterpriseRole.OWNER) {
      throw new ForbiddenError()
    }

    const constraint = await adapter.enterpriseUsageConstraintsRepository.delete({
      where: {
        enterprise_id: enterpriseId,
        id: constraintId,
      },
    })

    if (!constraint) {
      throw new NotFoundError()
    }

    return constraint
  }
}
