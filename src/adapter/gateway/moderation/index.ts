import { AdapterParams } from '@/adapter/types'
import { StorageGateway } from '../storage'
import { OpenrouterGateway } from '../openrouter'
import { buildVisionModerate, VisionModerate } from './vision-moderate'
import { buildModerate, Moderate } from './moderate'

type Params = Pick<AdapterParams, 'openaiModerationBalancer'> & {
  storageGateway: StorageGateway
  openrouterGateway: OpenrouterGateway
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
    visionModerate,
  }
}
