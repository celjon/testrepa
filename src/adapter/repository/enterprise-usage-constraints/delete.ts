import { IEnterpriseUsageConstraints } from '@/domain/entity/enterprise-usage-constraints'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (
  data: Prisma.EnterpriseUsageConstraintsDeleteArgs,
) => Promise<IEnterpriseUsageConstraints | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const chat = await db.client.enterpriseUsageConstraints.delete(data)

    return chat
  }
}
