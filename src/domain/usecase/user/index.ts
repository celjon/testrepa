import { UseCaseParams } from '@/domain/usecase/types'
import { buildExcel, Excel } from './excel'
import { buildList, List } from './list'
import { AdminUpdate, buildAdminUpdate } from './admin-update'
import { buildUpdate, Update } from './update'
import { buildGetPaymentMethods, GetPaymentMethods } from './get-payment-methods'
import { buildUpdateRegion, UpdateRegion } from './update-region'
import { buildSendVerifyUpdating, SendVerifyUpdating } from './send-verify-updating'

export type UserUseCase = {
  excel: Excel
  list: List
  adminUpdate: AdminUpdate
  update: Update
  sendVerifyUpdating: SendVerifyUpdating
  updateRegion: UpdateRegion
  getPaymentMethods: GetPaymentMethods
}

export const buildUserUseCase = (params: UseCaseParams): UserUseCase => {
  const excel = buildExcel(params)
  const list = buildList(params)
  const adminUpdate = buildAdminUpdate(params)
  const update = buildUpdate(params)
  const sendVerifyUpdating = buildSendVerifyUpdating(params)
  const updateRegion = buildUpdateRegion(params)
  const getPaymentMethods = buildGetPaymentMethods(params)

  return {
    excel,
    list,
    adminUpdate,
    update,
    sendVerifyUpdating,
    updateRegion,
    getPaymentMethods,
  }
}
