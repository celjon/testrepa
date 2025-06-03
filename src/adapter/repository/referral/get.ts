import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IReferral } from '@/domain/entity/referral'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.ReferralFindFirstArgs, tx?: unknown) => Promise<IReferral | null | never>
export const buildGet = ({ db }: Params): Get => {
  return async (data, tx) => {
    return await db.getContextClient(tx).referral.findFirst(data)
  }
}
