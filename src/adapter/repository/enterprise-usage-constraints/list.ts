import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IEnterpriseUsageConstraints } from '@/domain/entity/enterprise-usage-constraints'

type Params = Pick<AdapterParams, 'db'>

export type List = (
  data: Prisma.EnterpriseUsageConstraintsFindManyArgs,
) => Promise<Array<IEnterpriseUsageConstraints> | never>
export const buildList = ({ db }: Params): List => {
  return async (data) => {
    const chat = await db.client.enterpriseUsageConstraints.findMany(data)

    return chat
  }
}
