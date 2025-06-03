import { AdapterParams } from '@/adapter/types'
import { buildGet, Get } from './get'
import { buildCreate, Create } from './create'

type Params = Pick<AdapterParams, 'db'>

export type OldEmailRepository = {
  get: Get
  create: Create
}
export const buildOldEmailRepository = (params: Params): OldEmailRepository => {
  const get = buildGet(params)
  const create = buildCreate(params)

  return {
    get,
    create
  }
}
