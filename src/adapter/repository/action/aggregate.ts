import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export const buildAggregate = ({ db }: Params) => {
  return async (data: Prisma.ActionAggregateArgs) => {
    return db.client.action.aggregate(data)
  }
}
