import { IReferralTemplate } from '@/domain/entity/referral-template'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (
  params: Prisma.ReferralTemplateDeleteArgs,
) => Promise<IReferralTemplate | never>
export const buildDelete = ({ db }: Params): Delete => {
  return async (args) => {
    const t = (await db.client.referralTemplate.delete(args)) as IReferralTemplate

    return t
  }
}
