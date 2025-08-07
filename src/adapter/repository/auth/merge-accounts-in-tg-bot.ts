import { AdapterParams } from '@/adapter/types'
import { MergeAccountsParams } from '@/lib/clients/tg-bot-api'

type Params = Pick<AdapterParams, 'tgBot'>

export type MergeAccountsInTgBot = (data: MergeAccountsParams) => Promise<void>
export const buildMergeAccountsInTgBot = (params: Params): MergeAccountsInTgBot => {
  return async (data) => {
    await params.tgBot.client.mergeAccounts(data)
  }
}
