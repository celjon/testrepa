import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IReferral } from '@/domain/entity/referral'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.ReferralDeleteArgs) => Promise<IReferral | never>
export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const preset = (await db.client.referral.delete(data)) as IReferral

    return preset
  }
}
