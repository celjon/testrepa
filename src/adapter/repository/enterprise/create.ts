import { IEnterprise } from '@/domain/entity/enterprise'
import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type CreateEnterprise = (data: Prisma.EnterpriseCreateArgs) => Promise<IEnterprise | never>

export const buildCreateEnterprise = ({ db }: Params): CreateEnterprise => {
  return async (data) => {
    return await db.client.enterprise.create(data)
  }
}
