import { EnterpriseRole, EnterpriseType } from '@prisma/client'
import { ForbiddenError, InternalError, InvalidDataError, NotFoundError } from '@/domain/errors'
import { ISubscription } from '@/domain/entity/subscription'
import { UseCaseParams } from '@/domain/usecase/types'

export type ChangeEmployeeBalance = (data: {
  employeeId: string
  balanceDelta: number
  userId: string
}) => Promise<
  | {
      employeeSubscription: ISubscription
      enterpriseSubscription: ISubscription
    }
  | never
>

export const buildChangeEmployeeBalance = ({ adapter }: UseCaseParams): ChangeEmployeeBalance => {
  return async ({ employeeId, balanceDelta: balanceDeltaNumber, userId }) => {
    const employee = await adapter.employeeRepository.get({
      where: { id: employeeId },
    })
    const balanceDelta = BigInt(Math.trunc(balanceDeltaNumber))

    if (!employee) {
      throw new NotFoundError({
        code: 'EMPLOYEE_NOT_FOUND',
      })
    }

    const owner = await adapter.employeeRepository.get({
      where: {
        user_id: userId,
        enterprise_id: employee.enterprise_id,
        role: EnterpriseRole.OWNER,
      },
    })

    if (!owner) {
      throw new ForbiddenError()
    }

    const employeeSubscription = await adapter.subscriptionRepository.get({
      where: { user_id: employee.user_id },
      include: { user: true },
    })

    if (!employeeSubscription) {
      throw new ForbiddenError({
        code: 'EMPLOYEE_UNKNOWN_SUBSCRIPTION',
      })
    }
    const enterprise = await adapter.enterpriseRepository.get({
      where: { id: employee.enterprise_id },
    })

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const isChangingOwnerBalance = owner.user_id === employeeSubscription.user_id
    if (
      enterprise?.type !== EnterpriseType.CONTRACTED &&
      employeeSubscription.user!.created_at > thirtyDaysAgo &&
      balanceDelta < 0 &&
      !isChangingOwnerBalance
    ) {
      throw new ForbiddenError({
        code: 'CANNOT_WRITE_OFF_FROM_FRESH_SUBSCRIPTION',
      })
    }

    const enterpriseSubscription = await adapter.subscriptionRepository.get({
      where: { enterprise_id: employee.enterprise_id },
    })

    if (!enterpriseSubscription) {
      throw new ForbiddenError({
        code: 'ENTERPRISE_UNKNOWN_SUBSCRIPTION',
      })
    }

    if (balanceDelta > 0) {
      if (enterpriseSubscription.balance < balanceDelta) {
        throw new InvalidDataError({
          code: 'NOT_ENOUGH_CAPS',
        })
      }
    } else {
      if (employeeSubscription.balance + balanceDelta < 0) {
        throw new InvalidDataError({
          code: 'EMPLOYEE_CAPS_LESS_THAN_ZERO',
        })
      }
    }

    const { updatedEmployeeSubscription, updatedEnterpriseSubscription } =
      await adapter.transactor.inTx(async (tx) => {
        const updatedEmployeeSubscription = await adapter.subscriptionRepository.update(
          {
            where: { id: employeeSubscription.id },
            data: { balance: { increment: balanceDelta } },
          },
          tx,
        )

        if (!updatedEmployeeSubscription) {
          throw new InternalError()
        }

        const updatedEnterpriseSubscription = await adapter.subscriptionRepository.update(
          {
            where: { id: enterpriseSubscription.id },
            data: { balance: { decrement: balanceDelta } },
          },
          tx,
        )

        if (!updatedEnterpriseSubscription) {
          throw new InternalError()
        }

        return {
          updatedEmployeeSubscription,
          updatedEnterpriseSubscription,
        }
      })

    return {
      employeeSubscription: updatedEmployeeSubscription,
      enterpriseSubscription: updatedEnterpriseSubscription,
    }
  }
}
