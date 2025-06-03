import { AdapterParams } from '@/adapter/types'
import { buildSync, Sync } from './sync'
import { buildSend, Send } from './send'
import { StorageGateway } from '../storage'

type Params = Pick<AdapterParams, 'openaiBalancer' | 'openRouterBalancer' | 'openaiModerationBalancer'> & {
  storageGateway: StorageGateway
}

export type GptGateway = {
  send: Send
  sync: Sync
}

export const buildGptGateway = (params: Params): GptGateway => {
  const send = buildSend(params)
  const sync = buildSync(params)

  return {
    send,
    sync
  }
}
