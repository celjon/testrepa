import { ModelService } from '@/domain/service/model'
import { buildCreate, Create } from './create'
import { buildCreateElements, CreateElements } from './createElements'
import { Adapter } from '@/domain/types'

type Params = Adapter & {
  modelService: ModelService
}

export type Speech2TextService = {
  create: Create
  createElements: CreateElements
}

export const buildSpeech2TextService = (params: Params): Speech2TextService => {
  const create = buildCreate()
  const createElements = buildCreateElements(params)

  return {
    create,
    createElements
  }
}
