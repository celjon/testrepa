import { buildCreate, Create } from './create'
import { buildCreateElements, CreateElements } from './createElements'

export type MidjourneyService = {
  create: Create
  createElements: CreateElements
}

export const buildMidjourneyService = (): MidjourneyService => {
  const create = buildCreate()
  const createElements = buildCreateElements()

  return {
    create,
    createElements
  }
}
