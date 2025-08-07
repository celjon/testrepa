import * as XLSX from 'xlsx'
import {
  CreateExcelUserSpendingStatsByDeveloperKey,
  CreateExcelUserSpendingStatsByDeveloperKeyParams,
} from './types'

export const buildCreateExcelUserSpendingStatsByDeveloperKey =
  (): CreateExcelUserSpendingStatsByDeveloperKey => {
    return async ({ username, rows }: CreateExcelUserSpendingStatsByDeveloperKeyParams) => {
      const wb = XLSX.utils.book_new()
      const wsData: any[][] = []

      wsData.push(['Пользователь', username])

      wsData.push([])

      wsData.push(['Дата', 'Ключ', 'Потрачено CAPS'])
      rows.forEach((row) => {
        wsData.push([row.date, row.developerKey, row.amount])
      })

      wsData.push([])

      wsData.push(['Потрачено CAPS за период'])
      wsData.push([rows.reduce((acc, current) => acc + current.amount, 0)])
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      ws['!cols'] = [{ wch: 32 }, { wch: 31 }, { wch: 17 }]

      XLSX.utils.book_append_sheet(wb, ws, 'Отчет')
      return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    }
  }
