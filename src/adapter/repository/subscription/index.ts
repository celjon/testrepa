import { AdapterParams } from '@/adapter/types'
import { buildGet, Get } from './get'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './update-many'
import { buildList, List } from './list'
import { buildCount, Count } from './count'
import {
  buildGetLastSoftLimitNotification,
  buildSetLastSoftLimitNotification,
  GetLastSoftLimitNotification,
  SetLastSoftLimitNotification
} from './notifications'
import { buildFindMany, FindMany } from '@/adapter/repository/subscription/find-many'

type Params = Pick<AdapterParams, 'db' | 'redis'>

export type SubscriptionRepository = {
  get: Get
  update: Update
  findMany: FindMany
  updateMany: UpdateMany
  list: List
  count: Count
  setLastSoftLimitNotificationDate: SetLastSoftLimitNotification
  getLastSoftLimitNotificationDate: GetLastSoftLimitNotification
}

export const buildSubscriptionRepository = (params: Params): SubscriptionRepository => {
  const get = buildGet(params)
  const update = buildUpdate(params)
  const findMany = buildFindMany(params)
  const updateMany = buildUpdateMany(params)
  const list = buildList(params)
  const count = buildCount(params)
  return {
    get,
    update,
    findMany,
    updateMany,
    list,
    count,
    getLastSoftLimitNotificationDate: buildGetLastSoftLimitNotification(params),
    setLastSoftLimitNotificationDate: buildSetLastSoftLimitNotification(params)
  }
}
