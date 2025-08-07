import { Adapter } from '@/domain/types'
import { ForbiddenError } from '@/domain/errors'

export type CheckMonthLimit = (data: { userId: string }) => Promise<void>

export const buildCheckMonthLimit = ({ employeeRepository }: Adapter): CheckMonthLimit => {
  return async ({ userId }) => {
    const employee = await employeeRepository.get({
      where: { user_id: userId },
      include: { allowed_models: true, employee_group: true },
    })
    if (
      (employee?.spend_limit_on_month &&
        employee?.spent_in_month! > employee?.spend_limit_on_month) ||
      (employee?.employee_group?.spend_limit_on_month &&
        employee?.spent_in_month! > employee?.employee_group?.spend_limit_on_month)
    ) {
      throw new ForbiddenError({
        code: 'THE_MONTHLY_SPENDING_LIMIT_SET_BY_THE_ORGANIZATION_HAS_BEEN_EXCEEDED',
      })
    }
  }
}
