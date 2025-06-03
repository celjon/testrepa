import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type CountEnterprises = (params: Prisma.EnterpriseCountArgs) => Promise<number | never>
export const buildCountEnterprises = ({ db }: Params): CountEnterprises => {
  return async (args) => {
    return db.client.enterprise.count(args)
  }
}
