import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IFile } from '@/domain/entity/file'

type Params = Pick<AdapterParams, 'db'>

export type Create = (params: Prisma.FileCreateArgs) => Promise<IFile | never>
export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const file = (await db.client.file.create(data)) as IFile

    return file
  }
}
