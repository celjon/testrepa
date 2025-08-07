import { Observable } from 'rxjs'
import { EnterpriseRole, Role, TransactionType } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'

type EmployeesStatsEvent =
  | {
      event: 'CURRENT_BALANCE'
      data: {
        currentBalance: bigint
      }
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
            email: string | null
            tg_id: string | null
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
        }>
        totalEnterpriseTokensUsed: bigint
        totalEnterpriseTokensCredited: bigint
      }
    }

enum GetEmployeesStatsSort {
  ALPHABET,
  DESCENDING,
  ASCENDING,
}

export type GetEmployeesStatsStream = (data: {
  search?: string
  enterpriseId: string
  userId: string
  from: Date
  to: Date
  sort: GetEmployeesStatsSort
  includeTransactions?: boolean
}) => Promise<{
  responseStream$: Observable<EmployeesStatsEvent>
  closeStream: () => void
}>

export const buildGetEmployeesStatsStream = ({
  adapter,
  service,
}: UseCaseParams): GetEmployeesStatsStream => {
  return async ({ search, userId, from, to, enterpriseId, sort, includeTransactions }) => {
    const user = await adapter.userRepository.get({
      where: { id: userId },
      include: {
        employees: {
          where: {
            enterprise_id: enterpriseId,
            role: EnterpriseRole.OWNER,
          },
        },
      },
    })

    const isOwner = user?.employees?.length !== 0

    if (!isOwner && user.role !== Role.ADMIN) {
      throw new ForbiddenError({
        code: 'YOU_ARE_NOT_ADMIN',
      })
    }

    const streamStopped = { value: false }
    const responseStream$ = await service.enterprise.getEmployeesStatsObservable({
      search,
      from,
      to,
      enterpriseId,
      sort,
      streamStopped,
      includeTransactions,
    })
    return {
      responseStream$,
      closeStream: () => {
        streamStopped.value = true
      },
    }
  }
}
