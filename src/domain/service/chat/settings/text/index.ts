import { Adapter } from '@/domain/types'
import { buildCreate, Create } from './create'
import { buildCreateElements, CreateElements } from './createElements'
import { ModelService } from '@/domain/service/model'

type Params = Adapter & {
  modelService: ModelService
}

export type TextService = {
  create: Create
  createElements: CreateElements
}

export const buildTextService = (params: Params): TextService => {
  const create = buildCreate()
  const createElements = buildCreateElements(params)

  return {
    create,
    createElements
  }
}
