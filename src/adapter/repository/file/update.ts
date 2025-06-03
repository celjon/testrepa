import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IFile } from '@/domain/entity/file'

type Params = Pick<AdapterParams, 'db'>

export type Update = (params: Prisma.FileUpdateArgs) => Promise<IFile | null | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const user = (await db.client.file.update(data)) as IFile | null

    return user
  }
}
