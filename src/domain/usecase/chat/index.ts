import { UseCaseParams } from '@/domain/usecase/types'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildGet, Get } from './get'
import { buildClearContext, ClearContext } from './clear-context'
import { buildList, List } from './list'
import { buildUpdate, Update } from './update'
import { buildStream, Stream } from './stream'
import { buildGetSettings, GetSettings } from './get-settings'
import { buildUpdateSettings, UpdateSettings } from './update-settings'
import { buildGetJobs, GetJobs } from './get-jobs'
import { buildStop, Stop } from './stop'
import { buildGetInitial, GetInitial } from './get-initial'
import { buildDeleteMany, DeleteMany } from './delete-many'
import { buildMove, Move } from './move'
import { buildDeleteAllExcept, DeleteAllExcept } from './delete-all-except'

export type ChatUseCase = {
  get: Get
  getInitial: GetInitial
  create: Create
  delete: Delete
  deleteMany: DeleteMany
  deleteAllExcept: DeleteAllExcept
  clearContext: ClearContext
  list: List
  update: Update
  getSettings: GetSettings
  updateSettings: UpdateSettings
  stream: Stream
  getJobs: GetJobs
  stop: Stop
  move: Move
}

export const buildChatUseCase = (params: UseCaseParams): ChatUseCase => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const getInitial = buildGetInitial(params)
  const deleteChat = buildDelete(params)
  const deleteMany = buildDeleteMany(params)
  const deleteAllExcept = buildDeleteAllExcept(params)
  const clearContext = buildClearContext(params)
  const list = buildList(params)
  const update = buildUpdate(params)
  const getSettings = buildGetSettings(params)
  const updateSettings = buildUpdateSettings(params)
  const stream = buildStream(params)
  const getJobs = buildGetJobs(params)
  const stop = buildStop(params)
  const move = buildMove(params)

  return {
    get,
    getInitial,
    create,
    delete: deleteChat,
    deleteMany,
    deleteAllExcept,
    clearContext,
    list,
    update,
    getSettings,
    updateSettings,
    stream,
    getJobs,
    stop,
    move
  }
}
