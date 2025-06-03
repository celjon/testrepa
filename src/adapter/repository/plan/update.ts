import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPlan } from '@/domain/entity/plan'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.PlanUpdateArgs) => Promise<IPlan | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const plans = (await db.client.plan.update(data)) as IPlan

    return plans
  }
}
