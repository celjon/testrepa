import { AdapterParams } from '@/adapter/types'
import { buildSendImage, SendImage } from './send-image'
import { buildGetModels, GetModels } from './get-models'
import { buildGetProviders, GetProviders } from './get-providers'
import { buildSendVideo, SendVideo } from './send-video'

type Params = Pick<AdapterParams, 'replicate' | 'replicateBalancer'>

export type ReplicateGateway = {
  sendImage: SendImage
  getModels: GetModels
  getProviders: GetProviders
  sendVideo: SendVideo
}

export const buildReplicateGateway = (params: Params): ReplicateGateway => {
  const sendImage = buildSendImage(params)
  const getModels = buildGetModels(params)
  const getProviders = buildGetProviders()
  const sendVideo = buildSendVideo(params)

  return {
    sendImage,
    sendVideo,
    getModels,
    getProviders,
  }
}
