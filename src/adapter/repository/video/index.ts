import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'

type Params = Pick<AdapterParams, 'db'>

export type VideoRepository = {
  create: Create
}

export const buildVideoRepository = (params: Params): VideoRepository => {
  const create = buildCreate(params)

  return {
    create
  }
}
