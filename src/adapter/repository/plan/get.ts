import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPlan } from '@/domain/entity/plan'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.PlanFindFirstArgs) => Promise<IPlan | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const plan = (await db.client.plan.findFirst(data)) as IPlan

    return plan
  }
}
