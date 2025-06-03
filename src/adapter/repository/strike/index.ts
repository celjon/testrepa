import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildList, List } from './list'
import { buildUpdate, Update } from './update'
import { buildCount, Count } from './count'

type Params = Pick<AdapterParams, 'db'>

export type StrikeRepository = {
  count: Count
  create: Create
  list: List
  update: Update
}
export const buildStrikeRepository = (params: Params): StrikeRepository => {
  const count = buildCount(params)
  const create = buildCreate(params)
  const list = buildList(params)
  const update = buildUpdate(params)

  return {
    count,
    create,
    list,
    update
  }
}
