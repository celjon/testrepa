import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IReferralTemplate } from '@/domain/entity/referral-template'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.ReferralTemplateFindFirstArgs) => Promise<IReferralTemplate | never>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const preset = (await db.client.referralTemplate.findFirst(data)) as IReferralTemplate

    return preset
  }
}
