import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IReferral } from '@/domain/entity/referral'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.ReferralCreateArgs) => Promise<IReferral | never>
export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const preset = (await db.client.referral.create(data)) as IReferral

    return preset
  }
}
