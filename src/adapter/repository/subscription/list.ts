import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISubscription } from '@/domain/entity/subscription'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.SubscriptionFindManyArgs) => Promise<Array<ISubscription> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    return db.client.subscription.findMany(data)
  }
}
