import { ITransaction } from '@/domain/entity/transaction'
import ExcelJS from 'exceljs'

export type ToExcel = (data: Array<ITransaction>) => Promise<Buffer | never>

export const buildToExcel = (): ToExcel => {
  return async (transactions) => {
    const workbook = new ExcelJS.Workbook()

    workbook.calcProperties.fullCalcOnLoad = true

    const sheet = workbook.addWorksheet('Пользователи')

    sheet.columns = [
      { header: 'ID', key: 'id' },
      { header: 'Email/Tg_id', key: 'email', width: 32 },
      { header: 'Подписка', key: 'subscription', width: 32 },
      { header: 'Сумма', key: 'amount', width: 32 },
      { header: 'Дата оплаты', key: 'createdAt', width: 32 }
    ]

    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i]
      sheet.addRow({
        id: transaction.user!.id,
        email: transaction.user!.email || transaction.user!.tg_id,
        subscription: transaction.plan?.type || '',
        amount: `${transaction.amount} ${transaction.currency}`,
        createdAt: new Intl.DateTimeFormat('ru-RU').format(transaction.created_at)
      })
    }

    const file = await workbook.xlsx.writeBuffer()

    return file as Buffer
  }
}
