import * as XLSX from 'xlsx'
import { G4FExtendedProductUsage, Product } from '@/domain/entity/statistics'

export type CreateG4FExtendedProductUsageReport = (params: {
  usage: G4FExtendedProductUsage
  product: Product
}) => Promise<Buffer<ArrayBufferLike>>

export const buildCreateG4FExtendedProductUsageReport = (): CreateG4FExtendedProductUsageReport => {
  return async ({ usage, product }) => {
    const wb = XLSX.utils.book_new()

    const wsData: (string | number | bigint)[][] = []
    wsData.push(['Месяц и Год', 'Аккаунт', 'Модель', 'CAPS', 'Запросов'])

    for (const row of usage) {
      wsData.push([
        row.date,
        row.usage.accountName,
        row.usage.model.id,
        row.usage.model.caps,
        row.usage.model.requests,
      ])
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // column widths
    ws['!cols'] = [{ wch: 13 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }]

    XLSX.utils.book_append_sheet(wb, ws, `${product.toLowerCase()}`)

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  }
}
