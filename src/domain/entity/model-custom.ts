import { ModelCustom } from '@prisma/client'
import { IFile } from './file'

export interface IModelCustom extends ModelCustom {
  icon?: IFile | null
}
