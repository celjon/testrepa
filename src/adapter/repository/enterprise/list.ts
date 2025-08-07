import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IEnterprise } from '@/domain/entity/enterprise'

type Params = Pick<AdapterParams, 'db'>

export type ListEnterprises = (
  data?: Prisma.EnterpriseFindManyArgs,
) => Promise<Array<IEnterprise> | never>

export const buildListEnterprises = ({ db }: Params): ListEnterprises => {
  return async (data) => {
    return await db.client.enterprise.findMany(data)
  }
}
