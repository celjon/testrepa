import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPlan } from '@/domain/entity/plan'

type Params = Pick<AdapterParams, 'db'>

export type List = (data?: Prisma.PlanFindManyArgs) => Promise<Array<IPlan> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    const include = data?.include
      ? {
          ...data.include,
          models:
            typeof data.include.models === 'object'
              ? {
                  ...data.include.models,
                  where: {
                    ...data.include.models.where,
                    deleted_at: null,
                  },
                }
              : data.include.models
                ? { where: { deleted_at: null } }
                : data.include.models,
        }
      : undefined

    const plans = (await db.client.plan.findMany({
      ...data,
      ...(include ? { include } : {}),
    })) as Array<IPlan>
    return plans
  }
}
