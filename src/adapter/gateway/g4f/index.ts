import { AdapterParams } from '@/adapter/types'
import { buildGetModels, GetModels } from './get-models'
import { buildGetProviders, GetProviders } from './get-providers'
import { buildSend, Send } from './send'
import { buildSync, Sync } from './sync'
import { buildSendImage, SendImage } from './send-image'
import { buildWriteHarFile, WriteHarFile } from './write-har-file'
import { buildDeleteHarFile, DeleteHarFile } from './delete-har-file'
import { buildGetHarFiles, GetHarFiles } from './get-har-files'
import { buildAutoUpdateHARFiles, AutoUpdateHARFiles } from './auto-update-har-files'

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
    getHarFiles,
  }
}
