import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type UpdateMany = (data: Prisma.PlanModelUpdateManyArgs) => Promise<Prisma.BatchPayload | never>

export const buildUpdateMany = ({ db }: Params): UpdateMany => {
  return async (data) => {
    const planModel = await db.client.planModel.updateMany(data)

    return planModel
  }
}
