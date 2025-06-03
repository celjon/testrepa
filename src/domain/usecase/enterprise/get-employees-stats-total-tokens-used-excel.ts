import { Role } from '@prisma/client'
import { logger } from '@/lib/logger'
import { ForbiddenError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { getMonthName } from '@/lib'

type UsedTokensForDates = {
  year: string
  month: string
  usedTokens: bigint
}

export type GetEmployeesStatsTotalTokensUsedExcel = (data: {
  userId: string
  year: string | undefined
  month: string | undefined
}) => Promise<Buffer<ArrayBufferLike>>

export function buildGetEmployeesStatsTotalTokensUsedExcel({ adapter }: UseCaseParams): GetEmployeesStatsTotalTokensUsedExcel {
  return async ({ userId, year, month }) => {
    try {
      const user = await adapter.userRepository.get({
        where: { id: userId }
      })
      if (user!.role !== Role.ADMIN) {
        throw new ForbiddenError({ code: 'YOU_ARE_NOT_ADMIN' })
      }

      const transformData = (
        data: {
          name: string
          creator: string
          agreement_conclusion_date: string | null
          usedTokens: bigint
          month: string
          year: string
        }[]
      ): {
        name: string
        creator: string
        agreement_conclusion_date: string | null
        usedTokensForDates: UsedTokensForDates[]
      }[] => {
        const result: {
          name: string
          creator: string
          agreement_conclusion_date: string | null
          usedTokensForDates: UsedTokensForDates[]
        }[] = []
        let currentName = ''
        let currentCreator: string = 'USER'
        let currentAgreementConclusionDate: string | null = null
        let currentData: UsedTokensForDates[] = []

        data.forEach((entry, index) => {
          if (entry.name !== currentName) {
            if (currentData.length > 0) {
              result.push({
                name: currentName,
                agreement_conclusion_date: currentAgreementConclusionDate,
                creator: currentCreator,
                usedTokensForDates: currentData
              })
            }

            currentName = entry.name
            currentCreator = entry.creator
            currentAgreementConclusionDate = entry.agreement_conclusion_date ?? null
            currentData = []

            const startYear = 2023
            const startMonth = 10
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
            usedTokens: entry.usedTokens
          })

          if (index === data.length - 1) {
            result.push({
              name: currentName,
              agreement_conclusion_date: currentAgreementConclusionDate,
              creator: currentCreator,
              usedTokensForDates: currentData
            })
          }
        })

        return result
      }
      const enterprisesData = await adapter.enterpriseRepository.getAggregateEnterpriseTokensUsedForAllEnterprises(month, year)

      if (enterprisesData.length === 0) {
        logger.info('No transactions found for the given period.')
        const emptyExcelDocument = adapter.excelGateway.createExcelStatsForAllEnterprises({
          params: [
            {
              usedTokensForDates: [{ year: year ?? '', month: month ?? '', usedTokens: 0n }],
              name: 'данные за данный период',
              creator: 'отсутствуют',
              agreement_conclusion_date: ''
            }
          ]
        })
        return emptyExcelDocument
      }

      const stats = transformData(enterprisesData)
      const excelDocument = adapter.excelGateway.createExcelStatsForAllEnterprises({
        params: stats
      })
      return excelDocument
    } catch (error) {
      logger.error('Error in buildGetEmployeesStatsExcel', error)
      throw error
    }
  }
}

function addMissingMonths(firstYear: number, firstMonth: number, startYear: number, startMonth: number): UsedTokensForDates[] {
  const filledDates: UsedTokensForDates[] = []
  let currentYear = startYear
  let currentMonth = startMonth

  while (currentYear < firstYear || (currentYear === firstYear && currentMonth < firstMonth)) {
    const monthName = getMonthName(currentMonth)
    filledDates.push({ year: currentYear.toString(), month: monthName, usedTokens: 0n })

    currentMonth++
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear++
    }
  }

  return filledDates
}
