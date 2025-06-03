import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IFile } from '@/domain/entity/file'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (params: Prisma.FileDeleteArgs) => Promise<IFile | null | never>
export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const user = (await db.client.file.delete(data)) as IFile | null

    return user
  }
}
