import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildGet, Get } from './get'
import { buildDelete, Delete } from './delete'

type Params = Pick<AdapterParams, 'db'>

export type GiftCertificateRepository = {
  create: Create
  get: Get
  delete: Delete
}

export const buildGiftCertificateRepository = (params: Params): GiftCertificateRepository => {
  const create = buildCreate(params)
  const get = buildGet(params)
  const deleteAction = buildDelete(params)

  return {
    create,
    get,
    delete: deleteAction,
  }
}
