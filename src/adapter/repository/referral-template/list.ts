import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IReferralTemplate } from '@/domain/entity/referralTemplate'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.ReferralTemplateFindManyArgs) => Promise<Array<IReferralTemplate> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    const groups = (await db.client.referralTemplate.findMany(data)) as Array<IReferralTemplate>

    return groups
  }
}
