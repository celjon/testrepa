import { UseCaseParams } from '@/domain/usecase/types'
import { EnterpriseRole, PlanType } from '@prisma/client'
import { IEmployee } from '@/domain/entity/employee'
import { IPlan } from '@/domain/entity/plan'
import { ForbiddenError, InternalError, NotFoundError } from '@/domain/errors'

export type DeleteEmployee = (data: {
  employeeId: string
  userId: string
}) => Promise<IEmployee | never>
export const buildDeleteEmployee = ({ adapter }: UseCaseParams): DeleteEmployee => {
  return async ({ employeeId, userId }) => {
    const employee = await adapter.employeeRepository.get({
      where: {
        id: employeeId,
      },
      include: {
        user: { include: { subscription: true } },
      },
    })
    if (!employee) {
      throw new NotFoundError({
        code: 'EMPLOYEE_NOT_FOUND',
      })
    }

    const owner = await adapter.employeeRepository.get({
      where: { user_id: userId, enterprise_id: employee.enterprise_id },
    })
    if (!owner || owner.role !== EnterpriseRole.OWNER || owner.id === employeeId) {
      throw new ForbiddenError()
    }

    //Забираем неизрасходованные токены у пользователя в пользу компании и выставляем ему FREE план
    if (employee.user && employee.user.subscription) {
      const freePlan = (await adapter.planRepository.get({
        where: {
          type: PlanType.FREE,
        },
      })) as IPlan
      const tokens = employee.user.subscription.balance
      await adapter.subscriptionRepository.update({
        where: {
          id: employee.user.subscription.id,
        },
        data: {
          balance: 0,
          plan_id: freePlan.id,
        },
      })
      if (tokens > 0) {
        const enterpriseSubscription = await adapter.subscriptionRepository.get({
          where: {
            enterprise_id: employee.enterprise_id,
          },
        })
        await adapter.subscriptionRepository.update({
          where: {
            id: enterpriseSubscription!.id,
          },
          data: {
            balance: enterpriseSubscription!.balance + tokens,
          },
        })
      }
    }

    const deletedEmployee = await adapter.employeeRepository.delete({
      where: { id: employeeId },
    })

    if (!deletedEmployee) {
      throw new InternalError()
    }

    return deletedEmployee
  }
}
