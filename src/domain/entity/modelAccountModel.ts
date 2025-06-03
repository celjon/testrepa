import { ModelAccountModel } from '@prisma/client'
import { IModel } from './model'

export interface IModelAccountModel extends ModelAccountModel {
  model?: IModel
}
