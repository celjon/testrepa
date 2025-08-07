import { AdapterParams } from '@/adapter/types'
import { buildUpdate, Update } from './update'
import { buildCreate, Create } from './create'
import { buildGet, Get } from './get'

type Params = Pick<AdapterParams, 'db'>

export type MessageSetRepository = {
  update: Update
  create: Create
  get: Get
}

export const buildMessageSetRepository = (params: Params): MessageSetRepository => {
  const update = buildUpdate(params)
  const create = buildCreate(params)
  const get = buildGet(params)

  return {
    update,
    create,
    get,
  }
}
