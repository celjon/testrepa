import { UseCaseParams } from '@/domain/usecase/types'
import { IEnterprise } from '@/domain/entity/enterprise'
import { EnterpriseCreator, EnterpriseRole, EnterpriseType, PlanType, Role } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'
import { actions } from '@/domain/entity/action'

export type Create = (data: {
  name: string
  agreement_conclusion_date: string | null
  rubs_per_million_caps?: number
  type?: EnterpriseType
  common_pool: boolean
  tokens?: string
  plan?: string
  ownerId?: string
  userId?: string
}) => Promise<IEnterprise | null | never>

export const buildCreate = ({ adapter }: UseCaseParams): Create => {
  return async ({ name, agreement_conclusion_date, rubs_per_million_caps, type, common_pool, tokens, plan, ownerId, userId }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      },
      include: {
        employees: true,
        subscription: {
          include: {
            plan: true
          }
        }
      }
    })

    const isAdmin = user?.role === Role.ADMIN
    const isElite = user?.subscription?.plan?.type === PlanType.ELITE

    if (!user || (!isElite && !isAdmin)) {
      throw new ForbiddenError()
    }

    let owner

    if (!isAdmin || !ownerId) {
      ownerId = userId!
      owner = user
    } else {
      owner = await adapter.userRepository.get({
        where: {
          id: ownerId
        },
        include: {
          employees: true,
          subscription: true
        }
      })
    }

    if (!owner) {
      throw new ForbiddenError()
    }

    if (owner.employees && owner.employees.length > 0) {
      throw new ForbiddenError()
    }

    const existingEmployee = await adapter.employeeRepository.get({
      where: {
        user_id: ownerId
      }
    })

    if (existingEmployee) {
      throw new ForbiddenError({
        message: 'You are an employee of another organization'
      })
    }

    const resultTokens = isAdmin && tokens ? parseInt(tokens) : 0
    const resultPlan = isAdmin ? plan : user.subscription?.plan?.id

    const enterprise = await adapter.enterpriseRepository.create({
      data: {
        name: name,
        agreement_conclusion_date,
        rubs_per_million_caps: isAdmin ? rubs_per_million_caps : undefined,
        type: isAdmin && type ? type : EnterpriseType.REGULAR,
        creator: isAdmin ? EnterpriseCreator.ADMIN : EnterpriseCreator.USER,
        common_pool: common_pool,
        subscription: {
          create: {
            balance: resultTokens,
            plan_id: resultPlan
          }
        },
        employees: {
          create: {
            user_id: ownerId,
            role: EnterpriseRole.OWNER
          }
        },
        actions: {
          create: {
            type: actions.REGISTRATION,
            user_id: user.id
          }
        }
      },
      include: {
        employees: {
          include: {
            user: true
          }
        },
        subscription: {
          include: {
            plan: true
          }
        }
      }
    })

    if (isAdmin) {
      await adapter.subscriptionRepository.update({
        where: {
          user_id: ownerId
        },
        data: {
          plan_id: plan
        }
      })
    }

    return enterprise
  }
}
