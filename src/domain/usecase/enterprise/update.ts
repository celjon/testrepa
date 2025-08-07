import { UseCaseParams } from '@/domain/usecase/types'
import { IEnterprise } from '@/domain/entity/enterprise'
import {
  EnterprisePaymentPlanStatus,
  EnterpriseRole,
  EnterpriseType,
  Platform,
  Prisma,
  Role,
} from '@prisma/client'
import { ForbiddenError, InvalidDataError, NotFoundError } from '@/domain/errors'

export type Update = (data: {
  name: string
  agreement_conclusion_date: string | null
  rubs_per_million_caps: number
  type: EnterpriseType
  common_pool: boolean
  soft_limit?: number
  credit_limit?: number
  system_limit?: number
  balance: number
  plan: string
  id: string
  userId?: string
  payment_plan: EnterprisePaymentPlanStatus
  developerKeyId?: string
}) => Promise<IEnterprise | never>

export const buildUpdate = ({ adapter, service }: UseCaseParams): Update => {
  return async ({
    name,
    type,
    agreement_conclusion_date,
    rubs_per_million_caps,
    common_pool,
    balance,
    plan,
    id,
    userId,
    soft_limit,
    credit_limit,
    system_limit,
    payment_plan,
    developerKeyId,
  }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId,
      },
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND',
      })
    }

    const subscription = await adapter.subscriptionRepository.get({
      where: {
        enterprise_id: id,
      },
    })

    if (!subscription) {
      throw new NotFoundError({
        code: 'SUBSCRIPTION_NOT_FOUND',
      })
    }

    let isOwner = false
    const isAdmin = user?.role == Role.ADMIN

    if (!isAdmin) {
      const employee = await adapter.employeeRepository.get({
        where: {
          enterprise_id: id,
          user_id: userId,
          role: EnterpriseRole.OWNER,
        },
      })

      isOwner = !!employee
    }

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError({
        code: 'YOU_ARE_NOT_ADMIN',
      })
    }

    let updateData: Prisma.EnterpriseUpdateInput

    const currentHardLimit = credit_limit || subscription?.credit_limit

    if (isOwner) {
      if (credit_limit && subscription?.system_limit && credit_limit > subscription.system_limit) {
        throw new InvalidDataError()
      }

      if (soft_limit && currentHardLimit && soft_limit > currentHardLimit) {
        throw new InvalidDataError()
      }

      updateData = {
        common_pool,
        subscription: {
          update: {
            soft_limit,
            credit_limit,
          },
        },
      }
    } else {
      const currentSystemLimit = system_limit || subscription?.system_limit

      if (credit_limit && currentSystemLimit && credit_limit > currentSystemLimit) {
        throw new InvalidDataError()
      }

      if (soft_limit && currentHardLimit && soft_limit > currentHardLimit) {
        throw new InvalidDataError()
      }

      const tokens = BigInt(Math.trunc(balance))

      if (subscription.balance > tokens) {
        await service.subscription.writeOffWithLimitNotification({
          amount: Number(subscription.balance - tokens),
          subscription,
          meta: {
            enterpriseId: id,
            platform: Platform.ENTERPRISE,
            userId: user.id,
            from_user_id: userId,
            developerKeyId,
          },
        })
      } else if (subscription.balance < tokens) {
        await service.subscription.replenish({
          amount: Number(tokens - subscription.balance),
          subscription,
          meta: {
            from_user_id: userId,
          },
        })
      }
      updateData = {
        name,
        type,
        agreement_conclusion_date,
        rubs_per_million_caps,
        common_pool,
        subscription: {
          update: {
            soft_limit,
            system_limit,
            credit_limit,
            balance,
            payment_plan,
            plan_id: plan,
          },
        },
      }
    }

    const enterprise = await adapter.enterpriseRepository.update({
      where: {
        id,
      },
      data: updateData,
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

    await adapter.subscriptionRepository.updateMany({
      where: {
        user: {
          employees: {
            some: { enterprise_id: id },
          },
        },
      },
      data: {
        plan_id: plan,
      },
    })
    return enterprise
  }
}
