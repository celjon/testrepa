import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'

type Params = Pick<AdapterParams, 'db'>

export type VoiceRepository = {
  create: Create
}

export const buildVoiceRepository = (params: Params): VoiceRepository => {
  const create = buildCreate(params)

  return {
    create
  }
}
