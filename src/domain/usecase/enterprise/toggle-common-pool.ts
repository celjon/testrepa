import { UseCaseParams } from '@/domain/usecase/types'
import { IEnterprise } from '@/domain/entity/enterprise'
import { EnterpriseRole, Role } from '@prisma/client'
import { ForbiddenError, InternalError } from '@/domain/errors'

export type ToggleCommonPool = (data: {
  id: string
  userId: string
}) => Promise<IEnterprise | never>

export const buildToggleCommonPool = ({ adapter }: UseCaseParams): ToggleCommonPool => {
  return async ({ id, userId }) => {
    const user = await adapter.userRepository.get({
      where: { id: userId },
    })

    if (!user) {
      throw new ForbiddenError()
    }

    const enterprise = await adapter.enterpriseRepository.get({
      where: { id },
    })

    if (!enterprise) {
      throw new ForbiddenError()
    }

    if (user.role !== Role.ADMIN) {
      const employee = adapter.employeeRepository.get({
        where: {
          enterprise_id: id,
          user_id: userId,
          role: EnterpriseRole.OWNER,
        },
      })
      if (!employee) {
        throw new ForbiddenError()
      }
    }

    const updatedEnterprise = await adapter.enterpriseRepository.update({
      where: {
        id,
      },
      data: {
        common_pool: !enterprise.common_pool,
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

    if (!updatedEnterprise) {
      throw new InternalError()
    }

    return updatedEnterprise
  }
}
