import { IEnterprise } from '@/domain/entity/enterprise'
import { UseCaseParams } from '../types'
import { EnterpriseRole } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'

export type Get = (data: { id: string; userId: string }) => Promise<IEnterprise | never>

export const buildGet = ({ adapter }: UseCaseParams): Get => {
  return async ({ userId, id }) => {
    const employee = await adapter.employeeRepository.get({
      where: {
        user_id: userId,
        enterprise_id: id,
        role: EnterpriseRole.OWNER,
      },
      include: {
        enterprise: {
          include: {
            employees: {
              include: {
                user: {
                  include: {
                    subscription: true,
                  },
                },
                allowed_models: true,
              },
            },
            subscription: {
              include: {
                plan: true,
              },
            },
          },
        },
      },
    })

    if (!employee || !employee.enterprise) {
      throw new ForbiddenError()
    }

    return employee.enterprise
  }
}
