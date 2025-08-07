import { IEnterpriseUsageConstraints } from '@/domain/entity/enterprise-usage-constraints'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Create = (
  data: Prisma.EnterpriseUsageConstraintsCreateArgs,
) => Promise<IEnterpriseUsageConstraints | never>
export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const chat = await db.client.enterpriseUsageConstraints.create(data)

    return chat
  }
}
