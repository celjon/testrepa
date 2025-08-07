import { IUser } from '@/domain/entity/user'
import ExcelJS from 'exceljs'

export type ToExcel = (data: Array<IUser>) => Promise<Buffer | never>

export const buildToExcel = (): ToExcel => {
  return async (users) => {
    const workbook = new ExcelJS.Workbook()

    workbook.calcProperties.fullCalcOnLoad = true

    const sheet = workbook.addWorksheet('Пользователи')

    sheet.columns = [
      { header: 'ID', key: 'id' },
      { header: 'Email/Tg_id', key: 'email', width: 32 },
      { header: 'Подписка', key: 'subscription', width: 32 },
      { header: 'Дата регистрации', key: 'registeredAt', width: 32 },
    ]

    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      sheet.addRow({
        id: user.id,
        email: user.email || user.tg_id,
        subscription: user.subscription?.plan?.type || 'Нет подписки',
        registeredAt: new Intl.DateTimeFormat('ru-RU').format(user.created_at),
      })
    }

    const file = await workbook.xlsx.writeBuffer()

    return file as Buffer
  }
}
