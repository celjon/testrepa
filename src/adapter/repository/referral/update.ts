import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IReferral } from '@/domain/entity/referral'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.ReferralUpdateArgs) => Promise<IReferral | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const preset = (await db.client.referral.update(data)) as IReferral

    return preset
  }
}
