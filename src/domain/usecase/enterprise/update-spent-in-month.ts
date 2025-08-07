import { UseCaseParams } from '@/domain/usecase/types'
import { logger } from '@/lib/logger'

export type UpdateSpentInMonth = () => void

export const buildUpdateSpentInMonth = ({ adapter }: UseCaseParams): UpdateSpentInMonth => {
  return async () => {
    try {
      const result = await adapter.employeeRepository.updateMany({
        where: {
          spent_in_month: {
            not: null,
          },
        },
        data: {
          spent_in_month: 0n,
        },
      })

      logger.log({
        level: 'info',
        message: `Updated spent_in_month for ${result.count} employees.`,
      })
    } catch (error) {
      logger.log({
        level: 'error',
        message: `Update spent in month error: ${JSON.stringify(error)}`,
      })
    }
  }
}
