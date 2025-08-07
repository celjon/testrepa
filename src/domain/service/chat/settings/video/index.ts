import { Adapter } from '@/domain/types'
import { ModelService } from '@/domain/service/model'
import { buildCreate, Create } from './create'
import { buildCreateElements, CreateElements } from './create-element'
import { buildUpdate, Update } from './update'

type Params = Adapter & {
  modelService: ModelService
}

export type VideoService = {
  create: Create
  createElements: CreateElements
  update: Update
}

export const buildVideoService = (params: Params): VideoService => {
  return {
    create: buildCreate(),
    createElements: buildCreateElements(params),
    update: buildUpdate(),
  }
}
