import { AdapterParams } from '@/adapter/types'
import { IPlanModel } from '@/domain/entity/plan'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.PlanModelFindFirstArgs) => Promise<IPlanModel | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const planModel = (await db.client.planModel.findFirst(data)) as IPlanModel

    return planModel
  }
}
