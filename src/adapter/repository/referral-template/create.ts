import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IReferralTemplate } from '@/domain/entity/referralTemplate'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.ReferralTemplateCreateArgs) => Promise<IReferralTemplate | never>
export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const preset = (await db.client.referralTemplate.create(data)) as IReferralTemplate

    return preset
  }
}
