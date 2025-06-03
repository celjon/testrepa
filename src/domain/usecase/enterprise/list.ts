import { UseCaseParams } from '@/domain/usecase/types'
import { IEnterprise } from '@/domain/entity/enterprise'
import { EnterpriseRole, Role } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'

export type List = (data: { search?: string; page?: number; userId: string }) => Promise<
  | {
      data: Array<IEnterprise>
      pages: number
    }
  | never
>

export const buildList = ({ adapter, service }: UseCaseParams): List => {
  return async ({ search, page, userId }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (!user) {
      throw new ForbiddenError()
    }

    const query: any = {
      where: {
        name: {
          contains: search || '',
          mode: 'insensitive'
        }
      },
      include: {
        employees: {
          include: {
            user: {
              include: {
                subscription: true
              }
            }
          }
        },
        subscription: {
          include: {
            plan: true
          }
        }
      }
    }

    if (user.role !== Role.ADMIN) {
      const employees = await adapter.employeeRepository.list({
        where: {
          user_id: userId,
          role: EnterpriseRole.OWNER
        }
      })
      if (!employees) {
        return { data: [], pages: 0 }
      }
      const enterpriseIds: Array<string> = []

      for (let i = 0; i < employees.length; i++) {
        enterpriseIds.push(employees[i].id)
      }

      query.where.id = { in: enterpriseIds }
    }

    const enterprises = await service.enterprise.paginate({ query, page })

    return enterprises
  }
}
