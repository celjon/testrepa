import * as XLSX from 'xlsx'
import { CreateExcelStatsForAllEnterprises, CreateExcelStatsForAllEnterprisesParams } from './types'

export const buildCreateExcelStatsForAllEnterprises = (): CreateExcelStatsForAllEnterprises => {
  return async ({ params }: CreateExcelStatsForAllEnterprisesParams) => {
    const wb = XLSX.utils.book_new()

    const wsData: any[][] = []
    wsData.push(['', '', '', ...params[0].usedTokensForDates.map((year) => year.year)])
    wsData.push(['Фирма', 'Создатель', 'Дата договора', ...params[0].usedTokensForDates.map((month) => month.month)])

    for (const enterprise of params) {
      const { usedTokensForDates, name, creator, agreement_conclusion_date } = enterprise
      wsData.push([
        name,
        creator,
        agreement_conclusion_date ? agreement_conclusion_date : '',
        ...usedTokensForDates.map((date) => (date.usedTokens ? Math.trunc(Number(date.usedTokens)) : 0))
      ])
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // width columns
    ws['!cols'] = [
      { wch: 25 },
      { wch: 10 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 }
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Отчет')

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  }
}
