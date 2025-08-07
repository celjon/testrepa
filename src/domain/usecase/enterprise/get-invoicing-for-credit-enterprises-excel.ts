import { Role } from '@prisma/client'
import { logger } from '@/lib/logger'
import { ForbiddenError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { getMonthName } from '@/lib'

type CreditedTokensForDates = {
  year: string
  month: string
  creditedTokens: bigint
}

export type GetInvoicingForCreditEnterprisesExcel = (data: {
  userId: string
  year: string | undefined
  month: string | undefined
}) => Promise<Buffer<ArrayBufferLike>>

export function buildGetInvoicingForCreditEnterprisesExcel({
  adapter,
}: UseCaseParams): GetInvoicingForCreditEnterprisesExcel {
  return async ({ userId, year = '2025', month = '3' }) => {
    try {
      const user = await adapter.userRepository.get({
        where: { id: userId },
      })
      if (user!.role !== Role.ADMIN) {
        throw new ForbiddenError({ code: 'YOU_ARE_NOT_ADMIN' })
      }

      const transformData = (
        data: {
          name: string
          creator: string
          agreement_conclusion_date: string | null
          rubs_per_million_caps: number
          creditedTokens: bigint
          month: string
          year: string
        }[],
      ): {
        name: string
        creator: string
        agreement_conclusion_date: string | null
        rubs_per_million_caps: number
        creditedTokensForDates: CreditedTokensForDates[]
      }[] => {
        const result: {
          name: string
          creator: string
          agreement_conclusion_date: string | null
          rubs_per_million_caps: number
          creditedTokensForDates: CreditedTokensForDates[]
        }[] = []
        let currentName = ''
        let currentCreator: string = 'USER'
        let currentAgreementConclusionDate: string | null = null
        let currentrubs_per_million_caps: number = 250
        let currentData: CreditedTokensForDates[] = []

        data.forEach((entry, index) => {
          if (entry.name !== currentName) {
            if (currentData.length > 0) {
              result.push({
                name: currentName,
                agreement_conclusion_date: currentAgreementConclusionDate,
                creator: currentCreator,
                creditedTokensForDates: currentData,
                rubs_per_million_caps: currentrubs_per_million_caps,
              })
            }

            currentName = entry.name
            currentCreator = entry.creator
            currentAgreementConclusionDate = entry.agreement_conclusion_date ?? null
            currentrubs_per_million_caps = entry.rubs_per_million_caps
            currentData = []

            const startYear = 2025
            const startMonth = 3
            const entryYear = parseInt(entry.year)
            const entryMonth: number = parseInt(entry.month)
            if (!year && !month) {
              if (entryYear > startYear || (entryYear === startYear && entryMonth >= startMonth)) {
                currentData = addMissingMonths(entryYear, entryMonth, startYear, startMonth)
              }
            }
          }

          currentData.push({
            year: entry.year,
            month: getMonthName(parseInt(entry.month)),
            creditedTokens: entry.creditedTokens,
          })

          if (index === data.length - 1) {
            result.push({
              name: currentName,
              agreement_conclusion_date: currentAgreementConclusionDate,
              creator: currentCreator,
              creditedTokensForDates: currentData,
              rubs_per_million_caps: currentrubs_per_million_caps,
            })
          }
        })

        return result
      }

      //MIGRATION_ON_CLICKHOUSE
      /*const enterprisesData = await adapter.enterpriseRepository.getAggregateEnterpriseTokensCredited(month, year)*/

      const enterprises = await adapter.enterpriseRepository.list({})
      const enterprisesData = (
        await adapter.enterpriseRepository.chGetEnterpriseTokensCredited(month, year)
      ).map(({ enterprise_id, creditedTokens, month, year }) => {
        const enterprise = enterprises.find((e) => e.id === enterprise_id)
        return {
          name: enterprise?.name ?? 'UNDEFINED',
          creator: enterprise?.creator ?? 'USER',
          agreement_conclusion_date: enterprise?.agreement_conclusion_date ?? null,
          rubs_per_million_caps: enterprise?.rubs_per_million_caps ?? 216,
          creditedTokens,
          month,
          year,
        }
      })

      if (enterprisesData.length === 0) {
        logger.info('No transactions found for the given period.')
        const emptyExcelDocument = adapter.excelGateway.createExcelInvoicingForCreditEnterprises({
          params: [
            {
              creditedTokensForDates: [
                { year: year ?? '', month: month ?? '', creditedTokens: 0n },
              ],
              name: 'данные за данный период',
              creator: 'отсутствуют',
              agreement_conclusion_date: '',
              rubs_per_million_caps: 250,
            },
          ],
        })
        return emptyExcelDocument
      }

      const stats = transformData(enterprisesData)
      const excelDocument = adapter.excelGateway.createExcelInvoicingForCreditEnterprises({
        params: stats,
      })
      return excelDocument
    } catch (error) {
      logger.error('Error in buildGetEmployeesStatsExcel', error)
      throw error
    }
  }
}

function addMissingMonths(
  firstYear: number,
  firstMonth: number,
  startYear: number,
  startMonth: number,
): CreditedTokensForDates[] {
  const filledDates: CreditedTokensForDates[] = []
  let currentYear = startYear
  let currentMonth = startMonth

  while (currentYear < firstYear || (currentYear === firstYear && currentMonth < firstMonth)) {
    const monthName = getMonthName(currentMonth)
    filledDates.push({ year: currentYear.toString(), month: monthName, creditedTokens: 0n })

    currentMonth++
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear++
    }
  }

  return filledDates
}
