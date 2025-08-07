import { logger, logMemoryUsage } from '@/lib/logger'
import { ForbiddenError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { normalizeDate } from '@/lib'

export type GetUserSpendingByDeveloperKeyLabel = (params: {
  userId: string
  from: Date
  to: Date
}) => Promise<Buffer<ArrayBufferLike>>

export function buildGetUserSpendingByDeveloperKeyLabel({
  adapter,
}: UseCaseParams): GetUserSpendingByDeveloperKeyLabel {
  return async ({ userId, from, to }) => {
    try {
      const user = await adapter.userRepository.get({
        where: { id: userId },
      })
      if (!user) {
        logger.error(`User not found: ${userId}`)
        throw new ForbiddenError({ code: 'USER_NOT_FOUND' })
      }

      const startTs = performance.now()
      logMemoryUsage(
        `Start GetUserSpendingByDeveloperKeyLabel for targetUser=${userId}, from=${from.toISOString()}, to=${to.toISOString()}`,
      )

      const normalizedDateFrom = normalizeDate(from).toISOString()
      const toMidnightNext = normalizeDate(to).toISOString()

      //MIGRATION_ON_CLICKHOUSE
      /*const aggregated: { date: Date; spends: { developerKeyId: string; amount: number }[] }[] =
        await adapter.transactionRepository.getUserSpendingByDeveloperKeyLabel({
          userId,
          from: new Date(normalizedDateFrom),
          to: new Date(toMidnightNext)
        })*/

      const aggregated: { date: Date; spends: { developerKeyId: string; amount: number }[] }[] =
        await adapter.transactionRepository.chGetUserSpendingByDeveloperKeyLabel({
          userId,
          from: new Date(normalizedDateFrom),
          to: new Date(toMidnightNext),
        })

      const keys = await adapter.developerKeyRepository.list({ where: { user_id: userId } })

      if (aggregated.length === 0) {
        logger.info(
          `No spending data for user=${userId} in period ${from.toISOString()} - ${to.toISOString()}`,
        )
        const placeholderRows = [
          {
            date: from.toISOString().split('T')[0],
            developerKey: 'нет данных',
            amount: 0,
          },
        ]
        const emptyExcel: Buffer =
          await adapter.excelGateway.createExcelUserSpendingStatsByDeveloperKey({
            username: user.name ?? 'username',
            rows: placeholderRows,
          })
        logMemoryUsage(
          `End GetUserSpendingByDeveloperKeyLabel (no data) in ${(performance.now() - startTs).toFixed(2)}ms`,
        )
        return emptyExcel
      }

      const rows: { date: string; developerKey: string; amount: number }[] = []
      for (const entry of aggregated) {
        const day = entry.date
        const yyyy = day.getUTCFullYear().toString().padStart(4, '0')
        const mm = (day.getUTCMonth() + 1).toString().padStart(2, '0')
        const dd = day.getUTCDate().toString().padStart(2, '0')
        const dateStr = `${yyyy}-${mm}-${dd}`
        if (!entry.spends || entry.spends.length === 0) {
          rows.push({
            date: dateStr,
            developerKey: 'нет данных',
            amount: 0,
          })
        } else {
          for (const spend of entry.spends) {
            const currentKey = keys.find((value) => value.id === spend.developerKeyId)
            rows.push({
              date: dateStr,
              developerKey: currentKey?.label ?? spend.developerKeyId,
              amount: spend.amount,
            })
          }
        }
      }

      rows.sort((a, b) => {
        if (a.date < b.date) return -1
        if (a.date > b.date) return 1
        if (a.developerKey < b.developerKey) return -1
        if (a.developerKey > b.developerKey) return 1
        return 0
      })

      const excelBuffer: Buffer =
        await adapter.excelGateway.createExcelUserSpendingStatsByDeveloperKey({
          username: user.name ?? 'username',
          rows,
        })

      logMemoryUsage(
        `End GetUserSpendingByDeveloperKeyLabel in ${(performance.now() - startTs).toFixed(2)}ms for user=${userId}`,
      )
      return excelBuffer
    } catch (error) {
      logger.error('Error in GetUserSpendingByDeveloperKeyLabel', error)
      throw error
    }
  }
}
