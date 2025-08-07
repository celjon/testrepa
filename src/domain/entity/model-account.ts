import { ModelAccount, ModelAccountModelStatus, ModelAccountStatus } from '@prisma/client'
import { IFile } from './file'
import { IModelAccountModel } from './model-account-model'

export interface IModelAccount extends ModelAccount {
  g4f_har_file?: IFile
  models?: IModelAccountModel[]
  next_active?: IModelAccount | null
}

export const isActiveModelAccount = (account: IModelAccount) =>
  !account.disabled_at &&
  account.status === ModelAccountStatus.ACTIVE &&
  isInUsageLimit(account) &&
  (!account.models ||
    account.models.length === 0 ||
    account.models.some(
      (modelAccountModel) =>
        modelAccountModel.disabled_at === null &&
        modelAccountModel.status === ModelAccountModelStatus.ACTIVE,
    ))

export const isInUsageLimit = (account: IModelAccount) => {
  return account.usage_count_limit === 0 || account.usage_count < account.usage_count_limit
}

export const g4fIsOnlinePhase = (status: ModelAccountStatus) =>
  status === ModelAccountStatus.ACTIVE || status === ModelAccountStatus.INACTIVE

export const g4fIsOfflinePhase = (status: ModelAccountStatus) =>
  status === ModelAccountStatus.OFFLINE

export const g4fIsPhaseChanged = (
  currentStatus: ModelAccountStatus,
  newStatus: ModelAccountStatus,
) => {
  return (
    newStatus &&
    ((g4fIsOnlinePhase(currentStatus) && g4fIsOfflinePhase(newStatus)) ||
      (g4fIsOfflinePhase(currentStatus) && g4fIsOnlinePhase(newStatus)))
  )
}
