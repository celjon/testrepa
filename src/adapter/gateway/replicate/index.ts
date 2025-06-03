import { AdapterParams } from '@/adapter/types'
import { buildSendImage, SendImage } from './sendImage'
import { buildGetModels, GetModels } from './getModels'
import { buildGetProviders, GetProviders } from './getProviders'
import { buildSendVideo, SendVideo } from './sendVideo'

type Params = Pick<AdapterParams, 'replicate'>

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
    getProviders
  }
}
