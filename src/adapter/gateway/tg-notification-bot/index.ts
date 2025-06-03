import { AdapterParams } from '@/adapter/types'
import { buildSend, Send } from './send'

type Params = Pick<AdapterParams, 'tgNotificationBot'>

export type TgNotificationBotGateway = {
  send: Send
}

export const buildTgNotificationBotGateway = (params: Params): TgNotificationBotGateway => {
  const send = buildSend(params)

  return {
    send
  }
}
