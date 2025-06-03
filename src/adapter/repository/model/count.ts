import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (data?: Prisma.ModelCountArgs) => Promise<number | never>

export const buildCount = ({ db }: Params): Count => {
  return async (data) => {
    const count = await db.client.model.count({
      ...data,
      where: {
        deleted_at: null,
        ...(data ? data.where : {})
      }
    })

    return count
  }
}
