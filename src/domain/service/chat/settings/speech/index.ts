import { ModelService } from '@/domain/service/model'
import { buildCreate, Create } from './create'
import { buildCreateElements, CreateElements } from './createElements'
import { Adapter } from '@/domain/types'

type Params = Adapter & {
  modelService: ModelService
}

export type SpeechService = {
  create: Create
  createElements: CreateElements
}

export const buildSpeechService = (params: Params): SpeechService => {
  const create = buildCreate()
  const createElements = buildCreateElements(params)

  return {
    create,
    createElements
  }
}
