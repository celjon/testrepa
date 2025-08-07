import { Adapter } from '../../types'
import { buildInitialize, Initialize } from './initialize'
import { buildPaginate, Paginate } from './paginate'
import { buildEventStreamService, EventStreamService } from './event-stream'
import { buildSettingsService, SettingsService } from './settings'
import { ModelService } from '../model'
import { buildGenerateName, GenerateName } from './generate-name'

type Params = {
  modelService: ModelService
} & Adapter

export type ChatService = {
  paginate: Paginate
  initialize: Initialize
  generateName: GenerateName
  settings: SettingsService
  eventStream: EventStreamService
}

export const buildChatService = (params: Params): ChatService => {
  const paginate = buildPaginate(params)
  const settings = buildSettingsService(params)
  const generateName = buildGenerateName(params)
  const initialize = buildInitialize({
    ...params,
    settingsService: settings,
  })
  const eventStream = buildEventStreamService(params)

  return {
    paginate,
    initialize,
    generateName,
    settings,
    eventStream,
  }
}
