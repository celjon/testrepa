import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type DeleteMany = (params: Prisma.FileDeleteManyArgs) => Promise<number>
export const buildDeleteMany = ({ db }: Params): DeleteMany => {
  return async (data) => {
    const result = await db.client.file.deleteMany(data)
    return result.count
  }
}
