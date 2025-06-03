import { AdapterParams } from '@/adapter/types'
import { buildSend, Send } from './send'
import { buildEdit, Edit } from './edit'
import { StorageGateway } from '../storage'

type Params = Pick<AdapterParams, 'openaiDalleBalancer'> & {
  storageGateway: StorageGateway
}

export type DalleGateway = {
  send: Send
  edit: Edit
}

export const buildDalleGateway = (params: Params): DalleGateway => {
  return {
    send: buildSend(params),
    edit: buildEdit(params)
  }
}
