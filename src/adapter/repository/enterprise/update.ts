import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IEnterprise } from '@/domain/entity/enterprise'

type Params = Pick<AdapterParams, 'db'>

export type UpdateEnterprise = (params: Prisma.EnterpriseUpdateArgs) => Promise<IEnterprise | never>
export const buildUpdateEnterprise = ({ db }: Params): UpdateEnterprise => {
  return async (getParams) => {
    return await db.client.enterprise.update(getParams)
  }
}
