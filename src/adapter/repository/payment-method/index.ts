import { AdapterParams } from '@/adapter/types'
import { buildGet, Get } from './get'
import { buildCreate, Create } from './create'
import { buildUpdateMany, UpdateMany } from './update-many'

type Params = Pick<AdapterParams, 'db'>

export type PaymentMethodRepository = {
  get: Get
  create: Create
  updateMany: UpdateMany
}
export const buildPaymentMethodRepository = (params: Params): PaymentMethodRepository => {
  const get = buildGet(params)
  const create = buildCreate(params)
  const updateMany = buildUpdateMany(params)
  return {
    get,
    create,
    updateMany,
  }
}
