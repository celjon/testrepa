import { AdapterParams } from '@/adapter/types'
import { IFile } from '@/domain/entity/file'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type CreateMany = (params: Array<Prisma.FileCreateArgs>) => Promise<Array<IFile> | never>
export const buildCreateMany = ({ db }: Params): CreateMany => {
  return async (data) => {
    const files = (await db.client.$transaction(
      data.map((file) => db.client.file.create(file)),
    )) as Array<IFile>

    return files
  }
}
