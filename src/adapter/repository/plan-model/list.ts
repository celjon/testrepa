import { AdapterParams } from '@/adapter/types'
import { IPlanModel } from '@/domain/entity/plan'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.PlanModelFindManyArgs) => Promise<Array<IPlanModel> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    const planModel = (await db.client.planModel.findMany(data)) as Array<IPlanModel>

    return planModel
  }
}
