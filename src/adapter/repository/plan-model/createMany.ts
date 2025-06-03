import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type CreateMany = (data: Prisma.PlanModelCreateManyArgs) => Promise<Prisma.BatchPayload | never>

export const buildCreateMany = ({ db }: Params): CreateMany => {
  return async (data) => {
    const planModel = await db.client.planModel.createMany(data)

    return planModel
  }
}
