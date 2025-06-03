import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IFile } from '@/domain/entity/file'

type Params = Pick<AdapterParams, 'db'>

export type List = (params: Prisma.FileFindManyArgs) => Promise<Array<IFile> | never>
export const buildList = ({ db }: Params): List => {
  return async (data) => {
    const user = (await db.client.file.findMany(data)) as Array<IFile>

    return user
  }
}
