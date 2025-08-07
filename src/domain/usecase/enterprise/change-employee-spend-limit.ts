import { UseCaseParams } from '@/domain/usecase/types'
import { EnterpriseRole } from '@prisma/client'
import { ForbiddenError, InternalError, NotFoundError } from '@/domain/errors'
import { IEmployee } from '@/domain/entity/employee'

export type ChangeEmployeeSpendLimit = (data: {
  employeeId: string
  spend_limit_on_month: number
  userId: string
}) => Promise<
  | {
      employee: IEmployee
    }
  | never
>

export const buildChangeEmployeeSpendLimit = ({
  adapter,
}: UseCaseParams): ChangeEmployeeSpendLimit => {
  return async ({ employeeId, spend_limit_on_month, userId }) => {
    const employee = await adapter.employeeRepository.get({
      where: { id: employeeId },
    })

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

    const updatedEmployee = await adapter.employeeRepository.update({
      where: { id: employee.id },
      data: { spend_limit_on_month: BigInt(spend_limit_on_month) },
    })

    if (!updatedEmployee) {
      throw new InternalError()
    }

    return {
      employee: updatedEmployee,
    }
  }
}
