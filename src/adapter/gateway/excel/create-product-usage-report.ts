import * as XLSX from 'xlsx'
import { getMonthName } from '@/lib'
import { Product, ProductUsage } from '@/domain/entity/statistics'

export type CreateProductUsageReport = (params: { usage: ProductUsage; product: Product }) => Promise<Buffer<ArrayBufferLike>>

export const buildCreateProductUsageReport = (): CreateProductUsageReport => {
  return async ({ usage, product }) => {
    const wb = XLSX.utils.book_new()

    const wsData: (string | number | bigint)[][] = []
    wsData.push([
      'Месяц и Год',
      'FREE CAPS',
      'BASIC CAPS',
      'PREMIUM CAPS',
      'DELUXE CAPS',
      'ELITE CAPS',
      'Всего CAPS (платные тарифы)',
      'FREE Запросов',
      'BASIC Запросов',
      'PREMIUM Запросов',
      'DELUXE Запросов',
      'ELITE Запросов',
      'Всего запросов (платные тарифы)'
    ])

    for (const row of usage) {
      wsData.push([
        `${getMonthName(row.month)} ${row.year}`,
        row.usage.free.caps,
        row.usage.basic.caps,
        row.usage.premium.caps,
        row.usage.deluxe.caps,
        row.usage.elite.caps,
        row.usage.totalPaid.caps,
        row.usage.free.requests,
        row.usage.basic.requests,
        row.usage.premium.requests,
        row.usage.deluxe.requests,
        row.usage.elite.requests,
        row.usage.totalPaid.requests
      ])
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // column widths
    ws['!cols'] = [
      { wch: 13 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 35 }
    ]

    XLSX.utils.book_append_sheet(wb, ws, `${product.toLowerCase()}`)

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  }
}
