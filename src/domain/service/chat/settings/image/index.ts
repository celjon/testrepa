import { Adapter } from '@/domain/types'
import { ModelService } from '@/domain/service/model'
import { buildCreate, Create } from './create'
import { buildCreateElements, CreateElements } from './create-elements'
import { buildUpdate, Update } from './update'

type Params = Adapter & {
  modelService: ModelService
}

export type ImageService = {
  create: Create
  createElements: CreateElements
  update: Update
}

export const buildImageService = (params: Params): ImageService => {
  return {
    create: buildCreate(),
    createElements: buildCreateElements(params),
    update: buildUpdate(),
  }
}
