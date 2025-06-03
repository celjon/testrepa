import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (data: Prisma.StrikeCountArgs) => Promise<number | never>

export const buildCount = ({ db }: Params): Count => {
  return async (data) => {
    return db.client.strike.count(data)
  }
}
