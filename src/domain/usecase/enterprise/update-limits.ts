import { UseCaseParams } from '@/domain/usecase/types'
import { IEnterprise } from '@/domain/entity/enterprise'
import { EnterpriseRole, EnterpriseType } from '@prisma/client'
import { ForbiddenError, InvalidDataError } from '@/domain/errors'

export type UpdateLimits = (data: {
  id: string
  userId?: string
  soft_limit?: number
  credit_limit?: number
}) => Promise<IEnterprise | never>

export const buildUpdateLimits = ({ adapter }: UseCaseParams): UpdateLimits => {
  return async ({ id, userId, soft_limit, credit_limit }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId,
      },
    })

    if (!user) {
      throw new ForbiddenError()
    }

    let enterprise = await adapter.enterpriseRepository.get({
      where: {
        id,
      },
      include: {
        subscription: true,
      },
    })

    if (!enterprise || !enterprise.subscription) {
      throw new ForbiddenError()
    }

    const employee = await adapter.employeeRepository.get({
      where: {
        enterprise_id: id,
        user_id: userId,
        role: EnterpriseRole.OWNER,
      },
    })

    const isOwner = !!employee
    if (!isOwner) {
      throw new ForbiddenError()
    }

    const currentHardLimit = credit_limit || enterprise.subscription?.credit_limit

    if (
      credit_limit &&
      enterprise.subscription.system_limit &&
      credit_limit > enterprise.subscription.system_limit
    ) {
      throw new InvalidDataError({
        code: 'HARD_LIMIT_ERROR',
        message: 'Hard limit must be lower than system_limit',
      })
    }

    if (soft_limit && currentHardLimit && soft_limit > currentHardLimit) {
      throw new InvalidDataError({
        code: 'SOFT_LIMIT_ERROR',
        message: 'Soft limit must be lower than hard limit',
      })
    }

    enterprise = await adapter.enterpriseRepository.update({
      where: {
        id,
      },
      data: {
        subscription: {
          update: {
            soft_limit,
            ...(enterprise.type === EnterpriseType.CONTRACTED && {
              credit_limit,
            }),
          },
        },
      },
      include: {
        employees: {
          include: {
            user: true,
          },
        },
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    })

    if (!enterprise) {
      throw new ForbiddenError()
    }

    return enterprise
  }
}
