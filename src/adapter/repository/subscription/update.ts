import { AdapterParams, UnknownTx } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { ISubscription } from '@/domain/entity/subscription'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.SubscriptionUpdateArgs, tx?: UnknownTx) => Promise<ISubscription | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data, tx) => {
    return db.getContextClient(tx).subscription.update(data)
  }
}
