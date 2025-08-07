import { Adapter } from '../../types'
import { buildModerate, Moderate } from './moderate'

type Params = Adapter

export type MidjourneyService = {
  moderate: Moderate
}

export const buildMidjourneyService = (params: Params): MidjourneyService => {
  const moderate = buildModerate(params)

  return {
    moderate,
  }
}
