import { AdapterParams, UnknownTx } from '../../types'
import { Prisma } from '@prisma/client'
import { ISubscription } from '@/domain/entity/subscription'

type Params = Pick<AdapterParams, 'db'>

export type FindMany = (data: Prisma.SubscriptionFindManyArgs, tx?: UnknownTx) => Promise<ISubscription[] | never>
export const buildFindMany = ({ db }: Params): FindMany => {
  return async (data, tx) => {
    return db.getContextClient(tx).subscription.findMany(data)
  }
}
