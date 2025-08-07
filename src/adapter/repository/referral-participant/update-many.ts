import { AdapterParams, UnknownTx } from '../../types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type UpdateMany = (
  data: Prisma.ReferralParticipantUpdateManyArgs,
  tx?: UnknownTx,
) => Promise<Prisma.BatchPayload | never>
export const buildUpdateMany = ({ db }: Params): UpdateMany => {
  return async (data, tx) => {
    return db.getContextClient(tx).referralParticipant.updateMany(data)
  }
}
