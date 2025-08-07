import { AdapterParams } from '@/adapter/types'
import { NotifyAboutPresentParams } from '@/lib/clients/tg-bot-api'

type Params = Pick<AdapterParams, 'tgBot'>

export type NotifyAboutPresent = (data: NotifyAboutPresentParams) => Promise<void>
export const buildNotifyAboutPresent = (params: Params): NotifyAboutPresent => {
  return async (data) => {
    await params.tgBot.client.notifyAboutPresent(data)
  }
}
