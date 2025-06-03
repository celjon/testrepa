import { AdapterParams } from '@/adapter/types'
import { buildCreate, Create } from './create'
import { buildGet, Get } from './get'
import { buildDelete, Delete } from './delete'

type Params = Pick<AdapterParams, 'db'>

export type VerificationCodeRepository = {
  create: Create
  get: Get
  delete: Delete
}

export const buildVerificationCodeRepository = ({ db }: Params): VerificationCodeRepository => {
  return {
    create: buildCreate({ db }),
    get: buildGet({ db }),
    delete: buildDelete({ db })
  }
}
