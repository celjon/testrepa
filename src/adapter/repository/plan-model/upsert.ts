import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPlanModel } from '@/domain/entity/plan'

type Params = Pick<AdapterParams, 'db'>

export type Upsert = (data?: Prisma.PlanModelUpsertArgs) => Promise<IPlanModel | null | never>

export const buildUpsert = ({ db }: Params): Upsert => {
  return async (data) => {
    return (await db.client.planModel.upsert(data as any)) as IPlanModel
  }
}
