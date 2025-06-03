import { AdapterParams } from '@/adapter/types'
import { buildGetModels, GetModels } from './getModels'
import { buildSend, Send } from './send'
import { buildSendRawStream, buildSendRawSync, SendRawStream, SendRawSync } from './raw'
import { buildGetProviders, GetProviders } from './getProviders'
import { buildSync, Sync } from './sync'
import { StorageGateway } from '../storage'
import { buildGetModelProviders, GetModelProviders } from './getModelProviders'

type Params = Pick<AdapterParams, 'openRouter' | 'openRouterBalancer'> & {
  storageGateway: StorageGateway
}

export type OpenrouterGateway = {
  send: Send
  sync: Sync
  getModels: GetModels
  getProviders: GetProviders
  getModelProviders: GetModelProviders
  raw: {
    completions: {
      create: {
        stream: SendRawStream
        sync: SendRawSync
      }
    }
  }
}

export const buildOpenrouterGateway = (params: Params): OpenrouterGateway => {
  const send = buildSend(params)
  const sync = buildSync(params)
  const getModels = buildGetModels(params)
  const getProviders = buildGetProviders()
  const getModelProviders = buildGetModelProviders(params)

  return {
    send,
    sync,
    getModels,
    getProviders,
    getModelProviders,
    raw: {
      completions: {
        create: {
          sync: buildSendRawSync(params),
          stream: buildSendRawStream(params)
        }
      }
    }
  }
}
