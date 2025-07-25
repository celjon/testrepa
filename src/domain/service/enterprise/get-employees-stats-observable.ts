import { Observable } from 'rxjs'
import { TransactionType } from '@prisma/client'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'
import { Adapter } from '@/adapter'
import { NotFoundError } from '@/domain/errors'

const BATCH_SIZE = 1500
const MAX_TRANSACTIONS_TO_SEND = 3000 // every transaction has size about 1700 bytes, in json serialized format it will have bigger size. We need to send less than 50mb of data, or even less

export type GetEmployeesStatsObservable = (options: {
  from: Date
  to: Date
  search?: string
  sort: GetEmployeesStatsSort
  enterpriseId: string
  includeTransactions?: boolean
  streamStopped?: { value: boolean }
}) => Promise<Observable<EmployeesStatsEvent>>

type EmployeesStatsEvent =
  | {
      event: 'CURRENT_BALANCE'
      data: { currentBalance: bigint }
    }
  | {
      event: 'TRANSACTIONS'
      data: {
        transactions: {
          amount: number
          created_at: Date
          id: string
          type: TransactionType
          status: 'SUCCEDED'
          user: {
            id: string
            email: string
            tg_id: string
          }
        }[]
      }
    }
  | {
      event: 'EMPLOYEES'
      data: {
        employees: Array<{
          email: string | null
          id: string
          tg_id: string | null
          usedTokens: bigint
          requestsCount: number
        }>
        totalEnterpriseTokensUsed: bigint
        totalEnterpriseTokensCredited: bigint
      }
    }

export const buildGetEmployeesStatsObservable = ({
  enterpriseRepository,
  subscriptionRepository
}: Adapter): GetEmployeesStatsObservable => {
  return async ({ from, to, search, sort, enterpriseId, streamStopped, includeTransactions }): Promise<Observable<EmployeesStatsEvent>> => {
    return new Observable<EmployeesStatsEvent>((subscriber) => {
      const computeStats = async () => {
        try {
          const enterpriseSubscription = await subscriptionRepository.get({
            where: { enterprise_id: enterpriseId }
          })
          if (!enterpriseSubscription) {
            subscriber.error(
              new NotFoundError({
                code: 'ENTERPRISE_SUBSCRIPTION_NOT_FOUND'
              })
            )
            return
          }

          const stats = await enterpriseRepository.getEnterpriseStats({
            enterpriseId,
            from,
            to,
            search
          })

          const employees = sortEmployeesData(stats.employees, sort)
          const totalCapsUsed = stats.totalEnterpriseTokensUsed
          const totalCapsCredited = stats.totalEnterpriseTokensCredited
          const currentBalance = stats.currentBalance

          if (streamStopped?.value) {
            subscriber.complete()
            return
          }

          subscriber.next({
            event: 'CURRENT_BALANCE',
            data: { currentBalance }
          })

          subscriber.next({
            event: 'EMPLOYEES',
            data: {
              employees: employees,
              totalEnterpriseTokensUsed: totalCapsUsed,
              totalEnterpriseTokensCredited: totalCapsCredited
            }
          })

          if (includeTransactions) {
            let transactionsSent = 0
            while (true) {
              const transactions = await enterpriseRepository.getAggregateEnterpriseEmployeesTransactions({
                enterpriseId,
                from,
                to,
                search
              })

              if (transactionsSent < MAX_TRANSACTIONS_TO_SEND && transactions.length > 0) {
                subscriber.next({ event: 'TRANSACTIONS', data: { transactions } })
                transactionsSent += transactions.length
              }

              if (transactionsSent >= MAX_TRANSACTIONS_TO_SEND) {
                break
              }

              if (streamStopped?.value) {
                break
              }

              if (transactions.length < BATCH_SIZE) {
                break
              }
            }
          }

          subscriber.complete()
        } catch (e) {
          logger.error({
            location: 'getEmployeesStatsStreamObservable',
            message: getErrorString(e),
            enterpriseId,
            from,
            to
          })
          subscriber.error(e)
        }
      }

      computeStats()
    })
  }
}

enum GetEmployeesStatsSort {
  ALPHABET,
  DESCENDING,
  ASCENDING
}

const sortEmployeesData = (
  employees: {
    email: string | null
    id: string
    tg_id: string | null
    usedTokens: bigint
    requestsCount: number
  }[],
  algo: GetEmployeesStatsSort
) => {
  switch (algo) {
    case GetEmployeesStatsSort.ASCENDING:
      return employees.sort((a, b) => (a.usedTokens > b.usedTokens ? +1 : -1))
    case GetEmployeesStatsSort.DESCENDING:
      return employees.sort((a, b) => (b.usedTokens > a.usedTokens ? +1 : -1))
    case GetEmployeesStatsSort.ALPHABET:
      return employees.sort((a, b) => String(a.email).localeCompare(String(b.email)))
    default:
      return employees
  }
}
export const prepareSortParams = (sort: string): GetEmployeesStatsSort => {
  switch (sort) {
    case 'asc':
      return GetEmployeesStatsSort.ASCENDING
    case 'desc':
      return GetEmployeesStatsSort.DESCENDING
    case 'alphabet':
      return GetEmployeesStatsSort.ALPHABET
    default:
      return GetEmployeesStatsSort.ASCENDING
  }
}
