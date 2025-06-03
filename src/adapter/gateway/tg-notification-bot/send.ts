import { AdapterParams } from '@/adapter/types'
import { TgBotParseMode } from '@/lib/clients/tg-bot'

type Params = Pick<AdapterParams, 'tgNotificationBot'>

export type Send = (message: string, parseMode?: TgBotParseMode) => Promise<void>

export const buildSend =
  ({ tgNotificationBot }: Params): Send =>
  async (message, parseMode) =>
    tgNotificationBot.client.sendMessage(message, parseMode)
