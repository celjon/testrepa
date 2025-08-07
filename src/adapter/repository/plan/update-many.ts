import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type UpdateMany = (data: Prisma.PlanUpdateManyArgs) => Promise<Prisma.BatchPayload | never>

export const buildUpdateMany = ({ db }: Params): UpdateMany => {
  return async (data) => {
    const plans = await db.client.plan.updateMany(data)

    return plans
  }
}
