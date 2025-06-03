import * as XLSX from 'xlsx'
import { CreateExcelStatsForEnterprise, CreateExcelStatsForEnterpriseParams } from './types'

export const buildCreateExcelStatsForEnterprise = (): CreateExcelStatsForEnterprise => {
  return async ({
    enterpriseName,
    agreementConclusionDate,
    from,
    to,
    totalEnterpriseTokensCredited,
    totalEnterpriseTokensSpent,
    enterpriseEmployees
  }: CreateExcelStatsForEnterpriseParams) => {
    const rate = 1
    const rateForRSHB = 0.15

    const wb = XLSX.utils.book_new()
    const wsData: any[][] = []

    wsData.push(['Клиент', enterpriseName])
    wsData.push(['Дата заключения договора', agreementConclusionDate ?? null])

    wsData.push([])

    wsData.push(['Отчетный период', 'Начислено Токенов', 'Потрачено Токенов', 'Курс Caps к Токену .'])
    wsData.push([
      from && to ? `${formatDate(from)} - ${formatDate(to)}` : 'отсутствует',
      enterpriseName === 'RSHB' ? Number(totalEnterpriseTokensCredited) * rateForRSHB : Number(totalEnterpriseTokensCredited),
      enterpriseName === 'RSHB' ? Number(totalEnterpriseTokensSpent) * rateForRSHB : Number(totalEnterpriseTokensSpent),
      enterpriseName === 'RSHB' ? rateForRSHB : rate
    ])

    wsData.push([])

    wsData.push(['Детализация в разрезе пользователей'])
    wsData.push(['Логин', 'Потрачено Токенов'])
    enterpriseEmployees.forEach((employee) => {
      wsData.push([
        employee.email ?? employee.tg_id,
        enterpriseName === 'RSHB' ? Number(employee.usedTokens) * rateForRSHB : Number(employee.usedTokens)
      ])
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData)

    const columnWidths = [{ wch: 32 }, { wch: 31 }, { wch: 17 }, { wch: 17 }]
    ws['!merges'] = [{ s: { r: 6, c: 0 }, e: { r: 6, c: 2 } }]
    ws['!cols'] = columnWidths

    XLSX.utils.book_append_sheet(wb, ws, 'Отчет')
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  }
}

function formatDate(date: Date): string {
  const d = date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}
