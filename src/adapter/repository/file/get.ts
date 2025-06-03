import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IFile } from '@/domain/entity/file'

type Params = Pick<AdapterParams, 'db'>

export type Get = (params: Prisma.FileFindFirstArgs) => Promise<IFile | null | never>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const user = (await db.client.file.findFirst(data)) as IFile | null

    return user
  }
}
