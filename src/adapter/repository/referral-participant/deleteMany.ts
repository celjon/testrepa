import { AdapterParams, UnknownTx } from '../../types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type DeleteMany = (data: Prisma.ReferralParticipantDeleteManyArgs, tx?: UnknownTx) => Promise<Prisma.BatchPayload | never>
export const buildDeleteMany = ({ db }: Params): DeleteMany => {
  return async (data, tx) => {
    return db.getContextClient(tx).referralParticipant.deleteMany(data)
  }
}
