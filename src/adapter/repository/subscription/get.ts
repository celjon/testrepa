import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISubscription } from '@/domain/entity/subscription'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.SubscriptionFindFirstArgs) => Promise<ISubscription | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    return db.client.subscription.findFirst(data)
  }
}
