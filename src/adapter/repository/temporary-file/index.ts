import { AdapterParams } from '@/adapter/types'
import { buildCreateDecryptedFile, CreateDecryptedFile } from './create'
import { buildGetDecryptedFile, GetDecryptedFile } from './get'

type Params = Pick<AdapterParams, 'redis'>

export type TemporaryFileRepository = {
  create: CreateDecryptedFile
  get: GetDecryptedFile
}

export const buildTemporaryFileRepository = (params: Params) => {
  const create = buildCreateDecryptedFile(params)
  const get = buildGetDecryptedFile(params)

  return {
    create,
    get,
  }
}
