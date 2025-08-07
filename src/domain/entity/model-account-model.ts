import { ModelAccountModel } from '@prisma/client'
import { IModel } from './model'

export interface IModelAccountModel extends ModelAccountModel {
  model?: IModel
}

export enum ModelAccountModelStatusReason {
  G4F_MODEL_SUBSTITUTION = 'G4F_MODEL_SUBSTITUTION',
}
