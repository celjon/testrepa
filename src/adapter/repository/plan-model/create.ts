import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPlanModel } from '@/domain/entity/plan'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.PlanModelCreateArgs) => Promise<IPlanModel | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    return (await db.client.planModel.create(data)) as IPlanModel
  }
}
