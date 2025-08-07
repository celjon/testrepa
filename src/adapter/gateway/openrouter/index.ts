import { AdapterParams } from '@/adapter/types'
import { buildGetModels, GetModels } from './get-models'
import { buildSend, Send } from './send'
import { buildSendRawStream, buildSendRawSync, SendRawStream, SendRawSync } from './raw'
import { buildGetProviders, GetProviders } from './get-providers'
import { buildSync, Sync } from './sync'
import { StorageGateway } from '../storage'
import { buildGetModelProviders, GetModelProviders } from './get-model-providers'

type Params = Pick<AdapterParams, 'openRouter' | 'openRouterBalancer'> & {
  storageGateway: StorageGateway
}

export type OpenrouterGateway = {
  send: Send
  sync: Sync
  getModels: GetModels
  getProviders: GetProviders
  getModelProviders: GetModelProviders
  openRouterBalancer: AdapterParams['openRouterBalancer']
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
    openRouterBalancer: params.openRouterBalancer,
    raw: {
      completions: {
        create: {
          sync: buildSendRawSync(params),
          stream: buildSendRawStream(params),
        },
      },
    },
  }
}
