import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IEnterprise } from '@/domain/entity/enterprise'

type Params = Pick<AdapterParams, 'db'>

export type GetEnterprise = (data: Prisma.EnterpriseFindFirstArgs) => Promise<IEnterprise | null | never>

export const buildGetEnterprise = ({ db }: Params): GetEnterprise => {
  return async (data) => {
    return await db.client.enterprise.findFirst(data)
  }
}
