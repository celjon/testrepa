import { IEnterpriseUsageConstraints } from '@/domain/entity/enterprise-usage-constraints'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (
  data: Prisma.EnterpriseUsageConstraintsUpdateArgs,
) => Promise<IEnterpriseUsageConstraints | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const chat = await db.client.enterpriseUsageConstraints.update(data)

    return chat
  }
}
