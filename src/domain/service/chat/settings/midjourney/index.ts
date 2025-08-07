import { buildCreate, Create } from './create'
import { buildCreateElements, CreateElements } from './create-elements'
import { buildUpdate, Update } from './update'

export type MidjourneyService = {
  create: Create
  createElements: CreateElements
  update: Update
}

export const buildMidjourneyService = (): MidjourneyService => {
  return {
    create: buildCreate(),
    createElements: buildCreateElements(),
    update: buildUpdate(),
  }
}
