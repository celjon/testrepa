import * as XLSX from 'xlsx'
import { CreateExcelInvoicingForCreditEnterprises, CreateExcelInvoicingForCreditEnterprisesParams } from './types'

export const buildCreateExcelInvoicingForCreditEnterprises = (): CreateExcelInvoicingForCreditEnterprises => {
  return async ({ params }: CreateExcelInvoicingForCreditEnterprisesParams) => {
    const wb = XLSX.utils.book_new()

    const wsData: any[][] = []
    wsData.push(['RUB', '', '', '', ...params[0].creditedTokensForDates.map((year) => year.year)])
    wsData.push(['Фирма', 'Создатель', 'Дата договора', 'Курс', ...params[0].creditedTokensForDates.map((month) => month.month)])

    for (const enterprise of params) {
      const { creditedTokensForDates, name, creator, agreement_conclusion_date, rubs_per_million_caps } = enterprise

      const rate = rubs_per_million_caps / 1000000
      wsData.push([
        name,
        creator,
        agreement_conclusion_date ? agreement_conclusion_date : '',
        rubs_per_million_caps,
        ...creditedTokensForDates.map((date) => (date.creditedTokens ? Math.trunc(Number(date.creditedTokens) * rate) : 0))
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

    XLSX.utils.book_append_sheet(wb, ws, 'Выставление счета')

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  }
}
