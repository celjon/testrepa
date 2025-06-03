import { AdapterParams } from '@/adapter/types'
import { buildVisionModerate, VisionModerate } from './visionModerate'
import { buildModerate, Moderate } from './moderate'
import { StorageGateway } from '../storage'

type Params = Pick<AdapterParams, 'openaiModerationBalancer'> & {
  storageGateway: StorageGateway
}

export type ModerationGateway = {
  moderate: Moderate
  visionModerate: VisionModerate
}

export const buildModerationGateway = (params: Params): ModerationGateway => {
  const moderate = buildModerate(params)
  const visionModerate = buildVisionModerate(params)

  return {
    moderate,
    visionModerate
  }
}
