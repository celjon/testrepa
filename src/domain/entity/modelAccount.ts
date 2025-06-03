import { ModelAccount } from '@prisma/client'
import { IFile } from './file'
import { IModelAccountModel } from './modelAccountModel'

export interface IModelAccount extends ModelAccount {
  g4f_har_file?: IFile
  models?: IModelAccountModel[]
  next_active?: IModelAccount | null
}

export const isActiveModelAccount = (modelAccount: IModelAccount) =>
  !modelAccount.disabled_at &&
  (!modelAccount.models ||
    modelAccount.models.length === 0 ||
    modelAccount.models.some(
      (modelAccountModel) => modelAccountModel.disabled_at === null || modelAccountModel.usage_count < modelAccountModel.limit
    ))
