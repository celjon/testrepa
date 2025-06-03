import { Adapter } from '@/domain/types'
import { ModelService } from '@/domain/service/model'
import { buildCreate, Create } from './create'
import { buildCreateElements, CreateElements } from './createElement'

type Params = Adapter & {
  modelService: ModelService
}

export type VideoService = {
  create: Create
  createElements: CreateElements
}

export const buildVideoService = (params: Params): VideoService => {
  const create = buildCreate()
  const createElements = buildCreateElements(params)

  return {
    create,
    createElements
  }
}
