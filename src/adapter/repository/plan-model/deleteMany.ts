import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type DeleteMany = (data: Prisma.PlanModelDeleteManyArgs) => Promise<Prisma.BatchPayload | never>

export const buildDeleteMany = ({ db }: Params): DeleteMany => {
  return async (data) => {
    const planModel = await db.client.planModel.deleteMany(data)

    return planModel
  }
}
