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
import { buildListAll, ListAll } from './list-all'
import { buildChatPromptQueue, ChatPromptQueue } from './chat-prompt-queue'
import { buildUpdateSettings } from './../chat/update-settings'
import {
  buildOutputFilePromptQueue,
  OutputFilePromptQueue,
} from '@/domain/usecase/message/output-file-prompt-queue'
import { buildPromptQueueStream, PromptQueueStream } from './prompt-queue-stream'

export type MessageUseCase = {
  send: Send
  chatPromptQueue: ChatPromptQueue
  outputFilePromptQueue: OutputFilePromptQueue
  regenerate: Regenerate
  switch: Switch
  buttonClick: ButtonClick
  get: Get
  list: List
  listAll: ListAll
  update: Update
  delete: Delete
  deleteMany: DeleteMany
  promptQueueStream: PromptQueueStream
  report: {
    create: CreateReport
    delete: DeleteReport
    list: ListReport
  }
}

export const buildMessageUseCase = (params: UseCaseParams): MessageUseCase => {
  const send = buildSend(params)
  const get = buildGet(params)
  const promptQueueStream = buildPromptQueueStream(params)
  const updateChatSettings = buildUpdateSettings(params)
  const chatPromptQueue = buildChatPromptQueue({ ...params, send, get, updateChatSettings })
  const outputFilePromptQueue = buildOutputFilePromptQueue(params)
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
    chatPromptQueue,
    outputFilePromptQueue,
    regenerate,
    switch: s,
    buttonClick,
    get,
    list,
    listAll,
    update,
    delete: deleteMessage,
    deleteMany,
    promptQueueStream,
    report: {
      create: createReport,
      delete: deleteReport,
      list: listReport,
    },
  }
}
