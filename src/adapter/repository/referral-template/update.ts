import { IReferralTemplate } from '@/domain/entity/referralTemplate'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (params: Prisma.ReferralTemplateUpdateArgs) => Promise<IReferralTemplate | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (args) => {
    const t = (await db.client.referralTemplate.update(args)) as IReferralTemplate

    return t
  }
}
