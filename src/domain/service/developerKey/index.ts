import { Adapter } from '../../types'
import { buildCreate, Create } from './create'

export type DeveloperKeyService = {
  create: Create
}
export const buildDeveloperKeyService = (params: Adapter): DeveloperKeyService => {
  const create = buildCreate(params)
  return {
    create
  }
}
