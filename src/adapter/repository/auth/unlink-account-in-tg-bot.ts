import { AdapterParams } from '@/adapter/types'
import { UnlinkAccountParams } from '@/lib/clients/tg-bot-api'

type Params = Pick<AdapterParams, 'tgBot'>

export type UnlinkAccountInTgBot = (data: UnlinkAccountParams) => Promise<void>
export const buildUnlinkAccountInTgBot = (params: Params): UnlinkAccountInTgBot => {
  return async (data) => {
    await params.tgBot.client.unlinkAccount(data)
  }
}
