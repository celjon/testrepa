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
    balance = 0n,
    enterpriseEmployees,
  }: CreateExcelStatsForEnterpriseParams) => {
    const wb = XLSX.utils.book_new()
    const wsData: any[][] = []
    if (enterpriseName === 'RSHB') {
      wsData.push(['Клиент', enterpriseName])
      const rateForRSHB = 0.130208351985 //CALCULATED VALUE

      wsData.push(['Дата заключения договора', agreementConclusionDate ?? null])

      wsData.push([])

      wsData.push([
        'Отчетный период',
        'Начислено Токенов на баланс',
        'Списано Токенов с баланса',
        'Остаток Токенов на балансе',
        'Курс Caps к Токену',
      ])
      wsData.push([
        from && to ? `${formatDate(from)} - ${formatDate(to)}` : 'отсутствует',
        Math.round(Number(totalEnterpriseTokensCredited) * rateForRSHB),
        Math.round(Number(totalEnterpriseTokensCredited - balance) * rateForRSHB),
        Math.round(Number(balance) * rateForRSHB),
        rateForRSHB,
      ])

      wsData.push([])

      wsData.push(['Детализация в разрезе пользователей'])
      wsData.push(['Логин', 'Распределено Токенов'])
      enterpriseEmployees.forEach((employee) => {
        wsData.push([
          employee.email ?? employee.tg_id,
          Math.round(Number(employee.usedTokens + employee.balance!) * rateForRSHB),
        ])
      })
    } else {
      wsData.push(['Клиент', enterpriseName])
      wsData.push(['Дата заключения договора', agreementConclusionDate ?? null])

      wsData.push([])

      wsData.push(['Отчетный период', 'Начислено Токенов', 'Потрачено Токенов'])
      wsData.push([
        from && to ? `${formatDate(from)} - ${formatDate(to)}` : 'отсутствует',
        Number(totalEnterpriseTokensCredited),
        Number(totalEnterpriseTokensSpent),
      ])

      wsData.push([])

      wsData.push(['Детализация в разрезе пользователей'])
      wsData.push(['Логин', 'Потрачено Токенов'])
      enterpriseEmployees.forEach((employee) => {
        wsData.push([employee.email ?? employee.tg_id, Number(employee.usedTokens)])
      })
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData)

    const columnWidths = [
      { wch: 32 },
      { wch: 28 },
      { wch: 28 },
      { wch: 28 },
      { wch: 17 },
      { wch: 17 },
    ]
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
