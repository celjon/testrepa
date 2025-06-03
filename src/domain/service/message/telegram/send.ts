import { Adapter, TelegramGateway } from '@/domain/types'

export type SendTelegram = TelegramGateway['send']

export const buildSendTelegram = ({ telegramGateway }: Adapter): SendTelegram => {
  return async (data) => {
    await telegramGateway.send(data)
  }
}
