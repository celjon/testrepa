import { AdapterParams } from '@/adapter/types'
import { buildSend, Send } from './send'
import { buildNotifyAboutPresent, NotifyAboutPresent } from './notifyAboutPresent'

type Params = Pick<AdapterParams, 'tgBot'>

export type TelegramGateway = {
  send: Send
  notifyAboutPresent: NotifyAboutPresent
}
export const buildTelegramGateway = (params: Params): TelegramGateway => {
  const send = buildSend(params)
  const notifyAboutPresent = buildNotifyAboutPresent(params)

  return {
    send,
    notifyAboutPresent
  }
}
