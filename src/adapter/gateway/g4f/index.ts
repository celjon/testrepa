import { AdapterParams } from '@/adapter/types'
import { buildGetModels, GetModels } from './getModels'
import { buildGetProviders, GetProviders } from './getProviders'
import { buildSend, Send } from './send'
import { buildSync, Sync } from './sync'
import { buildSendImage, SendImage } from './sendImage'
import { buildWriteHarFile, WriteHarFile } from './writeHarFile'
import { buildDeleteHarFile, DeleteHarFile } from './deleteHarFile'
import { buildGetHarFiles, GetHarFiles } from './getHarFiles'
import { AutoUpdateHARFiles, buildAutoUpdateHARFiles } from './auto-update-har-files'

type Params = Pick<AdapterParams, 'g4f'>

export type G4FGateway = {
  send: Send
  sendImage: SendImage
  sync: Sync
  getModels: GetModels
  getProviders: GetProviders
  writeHarFile: WriteHarFile
  autoUpdateHARFiles: AutoUpdateHARFiles
  deleteHarFile: DeleteHarFile
  getHarFiles: GetHarFiles
}

export const buildG4FGateway = (params: Params): G4FGateway => {
  const send = buildSend(params)
  const sendImage = buildSendImage(params)
  const sync = buildSync(params)
  const getModels = buildGetModels(params)
  const getProviders = buildGetProviders(params)
  const writeHarFile = buildWriteHarFile(params)
  const autoUpdateHARFiles = buildAutoUpdateHARFiles(params)
  const deleteHarFile = buildDeleteHarFile(params)
  const getHarFiles = buildGetHarFiles(params)

  return {
    send,
    sendImage,
    sync,
    getModels,
    getProviders,
    writeHarFile,
    autoUpdateHARFiles,
    deleteHarFile,
    getHarFiles
  }
}
