import { buildList, List } from './list'
import { buildCreate, Create } from './create'
import { ChatService } from '../chat'
import { buildGet, Get } from './get'
import { buildStopAll, StopAll } from './stopAll'
import { Adapter } from '@/domain/types'
import { buildCreateInstance, CreateInstance } from './createInstance'
import { JobMap } from '@/domain/entity/job'
import { buildInit, Init } from './init'

type Params = {
  chatService: ChatService
} & Adapter

export type JobService = {
  init: Init
  create: Create
  createInstance: CreateInstance
  get: Get
  list: List
  stopAll: StopAll
}

export const buildJobService = (params: Params): JobService => {
  const jobMap: JobMap = {}

  const createInstance = buildCreateInstance({
    ...params,
    jobMap
  })
  const create = buildCreate({
    ...params,
    createInstance
  })
  const get = buildGet({
    ...params,
    createInstance,
    jobMap
  })
  const list = buildList(params)
  const stopAll = buildStopAll({
    ...params,
    createInstance
  })
  const init = buildInit({
    ...params,
    get
  })

  return {
    init,
    create,
    createInstance,
    get,
    list,
    stopAll
  }
}
