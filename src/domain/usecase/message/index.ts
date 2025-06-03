import { UseCaseParams } from '@/domain/usecase/types'
import { buildGet, Get } from './get'
import { buildList, List } from './list'
import { buildSend, Send } from './send'
import { buildButtonClick, ButtonClick } from './button-click'
import { buildUpdate, Update } from './update'
import { buildDelete, Delete } from './delete'
import { buildDeleteMany, DeleteMany } from './delete-many'
import { buildRegenerate, Regenerate } from './regenerate'
import { buildSwitch, Switch } from './switch'
import { buildCreateReport, CreateReport } from './report/create'
import { buildDeleteReport, DeleteReport } from './report/delete'
import { buildListReport, ListReport } from './report/list'
import { buildListAll, ListAll } from './listAll'
import { buildPromptQueue, PromptQueue } from './prompt-queue'
import { buildUpdateSettings } from './../chat/update-settings'

export type MessageUseCase = {
  send: Send
  promptQueue: PromptQueue
  regenerate: Regenerate
  switch: Switch
  buttonClick: ButtonClick
  get: Get
  list: List
  listAll: ListAll
  update: Update
  delete: Delete
  deleteMany: DeleteMany
  report: {
    create: CreateReport
    delete: DeleteReport
    list: ListReport
  }
}

export const buildMessageUseCase = (params: UseCaseParams): MessageUseCase => {
  const send = buildSend(params)
  const get = buildGet(params)
  const updateChatSettings = buildUpdateSettings(params)
  const promptQueue = buildPromptQueue({ ...params, send, get, updateChatSettings })
  const regenerate = buildRegenerate(params)
  const s = buildSwitch(params)
  const buttonClick = buildButtonClick(params)
  const list = buildList(params)
  const listAll = buildListAll(params)
  const update = buildUpdate(params)
  const deleteMessage = buildDelete(params)
  const deleteMany = buildDeleteMany(params)
  const createReport = buildCreateReport(params)
  const deleteReport = buildDeleteReport(params)
  const listReport = buildListReport(params)

  return {
    send,
    promptQueue,
    regenerate,
    switch: s,
    buttonClick,
    get,
    list,
    listAll,
    update,
    delete: deleteMessage,
    deleteMany,
    report: {
      create: createReport,
      delete: deleteReport,
      list: listReport
    }
  }
}
