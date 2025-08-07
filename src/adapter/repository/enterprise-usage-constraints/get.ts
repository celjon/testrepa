import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IEnterpriseUsageConstraints } from '@/domain/entity/enterprise-usage-constraints'

type Params = Pick<AdapterParams, 'db'>

export type Get = (
  data: Prisma.EnterpriseUsageConstraintsFindFirstArgs,
) => Promise<IEnterpriseUsageConstraints | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const chat = (await db.client.enterpriseUsageConstraints.findFirst(
      data,
    )) as IEnterpriseUsageConstraints

    return chat
  }
}
