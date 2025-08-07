import { Adapter } from '@/domain/types'
import { ModelService } from '@/domain/service/model'
import { buildCreate, Create } from './create'
import { buildCreateElements, CreateElements } from './create-elements'
import { buildUpdate, Update } from './update'

type Params = Adapter & {
  modelService: ModelService
}

export type ReplicateImageService = {
  create: Create
  createElements: CreateElements
  update: Update
}

export const buildReplicateImageService = (params: Params): ReplicateImageService => {
  const create = buildCreate()
  const createElements = buildCreateElements(params)
  const update = buildUpdate()

  return {
    create,
    createElements,
    update,
  }
}
