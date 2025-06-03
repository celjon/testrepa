import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IReferral } from '@/domain/entity/referral'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.ReferralFindManyArgs) => Promise<Array<IReferral> | never>
export const buildList = ({ db }: Params): List => {
  return async (data) => {
    const preset = (await db.client.referral.findMany(data)) as Array<IReferral>

    return preset
  }
}
