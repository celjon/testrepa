import { AdapterParams } from '@/adapter/types'
import { IEnterprise } from '@/domain/entity/enterprise'

type Params = Pick<AdapterParams, 'db'>

export type GetAllEnterprise = () => Promise<IEnterprise[]>

export const buildGetAllEnterprise = ({ db }: Params): GetAllEnterprise => {
  return async () => {
    return await db.client.enterprise.findMany()
  }
}
