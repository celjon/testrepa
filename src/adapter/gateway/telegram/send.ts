import { AdapterParams } from '@/adapter/types'
import { SendMessageParams } from '@/lib/clients/tg-bot-api'

type Params = Pick<AdapterParams, 'tgBot'>

export type Send = (data: SendMessageParams) => Promise<void>
export const buildSend = (params: Params): Send => {
  return async (data) => {
    await params.tgBot.client.sendMessage(data)
  }
}
