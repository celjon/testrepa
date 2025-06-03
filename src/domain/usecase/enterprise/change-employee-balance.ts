import { UseCaseParams } from '@/domain/usecase/types'
import { EnterpriseRole } from '@prisma/client'
import { ISubscription } from '@/domain/entity/subscription'
import { ForbiddenError, InternalError, InvalidDataError, NotFoundError } from '@/domain/errors'

export type ChangeEmployeeBalance = (data: { employeeId: string; balanceDelta: number; userId: string }) => Promise<
  | {
      employeeSubscription: ISubscription
      enterpriseSubscription: ISubscription
    }
  | never
>

export const buildChangeEmployeeBalance = ({ adapter }: UseCaseParams): ChangeEmployeeBalance => {
  return async ({ employeeId, balanceDelta: balanceDeltaNumber, userId }) => {
    const employee = await adapter.employeeRepository.get({
      where: { id: employeeId }
    })
    const balanceDelta = BigInt(Math.trunc(balanceDeltaNumber))

    if (!employee) {
      throw new NotFoundError({
        code: 'EMPLOYEE_NOT_FOUND'
      })
    }

    const owner = await adapter.employeeRepository.get({
      where: {
        user_id: userId,
        enterprise_id: employee.enterprise_id,
        role: EnterpriseRole.OWNER
      }
    })

    if (!owner) {
      throw new ForbiddenError()
    }

    const employeeSubscription = await adapter.subscriptionRepository.get({
      where: { user_id: employee.user_id }
    })

    if (!employeeSubscription) {
      throw new ForbiddenError({
        code: 'EMPLOYEE_UNKNOWN_SUBSCRIPTION'
      })
    }

    const enterpriseSubscription = await adapter.subscriptionRepository.get({
      where: { enterprise_id: employee.enterprise_id }
    })

    if (!enterpriseSubscription) {
      throw new ForbiddenError({
        code: 'ENTERPRISE_UNKNOWN_SUBSCRIPTION'
      })
    }

    if (balanceDelta > 0) {
      if (enterpriseSubscription.balance < balanceDelta) {
        throw new InvalidDataError({
          code: 'NOT_ENOUGH_CAPS'
        })
      }
    } else {
      if (employeeSubscription.balance + balanceDelta < 0) {
        throw new InvalidDataError({
          code: 'EMPLOYEE_CAPS_LESS_THAN_ZERO'
        })
      }
    }
    const updatedEmployeeSubscription = await adapter.subscriptionRepository.update({
      where: { id: employeeSubscription.id },
      data: { balance: employeeSubscription.balance + balanceDelta }
    })

    if (!updatedEmployeeSubscription) {
      throw new InternalError()
    }

    const updatedEnterpriseSubscription = await adapter.subscriptionRepository.update({
      where: { id: enterpriseSubscription.id },
      data: { balance: enterpriseSubscription.balance - balanceDelta }
    })

    if (!updatedEnterpriseSubscription) {
      throw new InternalError()
    }

    return {
      employeeSubscription: updatedEmployeeSubscription,
      enterpriseSubscription: updatedEnterpriseSubscription
    }
  }
}
