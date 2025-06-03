import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildUpdateMany, UpdateMany } from './updateMany'
import { buildUpdate, Update } from './update'
import { buildList, List } from './list'
import { buildCount, Count } from './count'
import { buildGet, Get } from './get'
import { buildDelete, Delete } from './delete'
import { buildDeleteMany, DeleteMany } from './deleteMany'
import { buildCreateReport, CreateReport } from '@/adapter/repository/message/report/create'
import { buildDeleteReport, DeleteReport } from '@/adapter/repository/message/report/delete'
import { buildListReport, ListReport } from '@/adapter/repository/message/report/list'

type Params = Pick<AdapterParams, 'db'>

export type MessageRepository = {
  get: Get
  create: Create
  updateMany: UpdateMany
  update: Update
  list: List
  count: Count
  delete: Delete
  deleteMany: DeleteMany
  createReport: CreateReport
  deleteReport: DeleteReport
  listReport: ListReport
}

export const buildMessageRepository = (params: Params): MessageRepository => {
  const get = buildGet(params)
  const create = buildCreate(params)
  const deleteMessage = buildDelete(params)
  const deleteMany = buildDeleteMany(params)
  const updateMany = buildUpdateMany(params)
  const update = buildUpdate(params)
  const list = buildList(params)
  const count = buildCount(params)
  const createReport = buildCreateReport(params)
  const deleteReport = buildDeleteReport(params)
  const listReport = buildListReport(params)

  return {
    get,
    create,
    updateMany,
    update,
    list,
    count,
    delete: deleteMessage,
    deleteMany,
    createReport,
    deleteReport,
    listReport
  }
}
