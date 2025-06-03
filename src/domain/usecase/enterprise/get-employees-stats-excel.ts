import { EnterpriseRole, Role } from '@prisma/client'
import { logger } from '@/lib/logger'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'

enum GetEmployeesStatsSort {
  ALPHABET,
  DESCENDING,
  ASCENDING
}

export type GetEmployeesStatsExcel = (data: {
  search?: string
  enterpriseId: string
  userId: string
  from: Date
  to: Date
  sort: GetEmployeesStatsSort
}) => Promise<Buffer<ArrayBufferLike>>

export function buildGetEmployeesStatsExcel({ adapter, service }: UseCaseParams): GetEmployeesStatsExcel {
  return async ({ search, userId, from, to, enterpriseId, sort }) => {
    try {
      const user = await adapter.userRepository.get({
        where: { id: userId },
        include: {
          employees: {
            where: {
              enterprise_id: enterpriseId,
              role: EnterpriseRole.OWNER
            }
          }
        }
      })
      const isOwner = user?.employees?.length !== 0
      if (!isOwner && user.role !== Role.ADMIN) {
        throw new ForbiddenError({ code: 'YOU_ARE_NOT_ADMIN' })
      }

      const [enterpriseSubscription, enterprise] = await Promise.all([
        adapter.subscriptionRepository.get({
          where: { enterprise_id: enterpriseId }
        }),
        adapter.enterpriseRepository.get({
          where: { id: enterpriseId }
        })
      ])

      if (!enterpriseSubscription) {
        throw new NotFoundError({ code: 'ENTERPRISE_SUBSCRIPTION_NOT_FOUND' })
      }

      const transactionsObservable = await service.enterprise.getEmployeesStatsObservable({
        search,
        from,
        to,
        enterpriseId,
        sort
      })
      const collectedData: {
        totalTokensSpent: bigint
        totalTokensCredited: bigint
        employeesData: {
          email: string | null
          id: string
          tg_id: string | null
          usedTokens: bigint
        }[]
      } = await new Promise((resolve, reject) => {
        let totalTokensSpent = 0n
        let totalTokensCredited = 0n
        let employeesData: Array<{
          email: string | null
          id: string
          tg_id: string | null
          usedTokens: bigint
        }> = []

        transactionsObservable.subscribe({
          next: (event) => {
            if (event.event === 'EMPLOYEES') {
              employeesData = event.data.employees
              totalTokensSpent = event.data.totalEnterpriseTokensUsed
              totalTokensCredited = event.data.totalEnterpriseTokensCredited
            }
          },
          error: (err) => reject(err),
          complete: () =>
            resolve({
              employeesData: employeesData,
              totalTokensSpent: totalTokensSpent,
              totalTokensCredited: totalTokensCredited
            })
        })
      })

      const excelDocument = adapter.excelGateway.createExcelStatsForEnterprise({
        enterpriseName: enterprise!.name,
        agreementConclusionDate: enterprise!.agreement_conclusion_date,
        from: from,
        to: to,
        totalEnterpriseTokensCredited: collectedData.totalTokensCredited,
        totalEnterpriseTokensSpent: collectedData.totalTokensSpent,
        enterpriseEmployees: collectedData.employeesData
      })

      return excelDocument
    } catch (error) {
      logger.error('Error in buildGetEmployeesStatsExcel', error)
      throw error
    }
  }
}
