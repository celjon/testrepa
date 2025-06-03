import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (data: Prisma.PlanCountArgs) => Promise<number | never>

export const buildCount = ({ db }: Params): Count => {
  return async (data) => {
    const amount = await db.client.plan.count(data)

    return amount
  }
}
