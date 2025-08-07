import * as XLSX from 'xlsx'
import { getMonthName } from '@/lib'
import { G4FProductUsage, Product } from '@/domain/entity/statistics'

export type CreateG4FProductUsageReport = (params: {
  usage: G4FProductUsage
  product: Product
}) => Promise<Buffer<ArrayBufferLike>>

export const buildCreateG4FProductUsageReport = (): CreateG4FProductUsageReport => {
  return async ({ usage, product }) => {
    const wb = XLSX.utils.book_new()

    const wsData: (string | number | bigint)[][] = []
    wsData.push(['Месяц и Год', 'Модель', 'CAPS', 'Запросов', 'Аккаунтов'])

    for (const row of usage) {
      wsData.push([
        `${getMonthName(row.month)} ${row.year}`,
        row.usage.model.id,
        row.usage.model.caps,
        row.usage.model.requests,
        row.usage.model.usedAccounts,
      ])
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // column widths
    ws['!cols'] = [{ wch: 13 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }]

    XLSX.utils.book_append_sheet(wb, ws, `${product.toLowerCase()}`)

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  }
}
