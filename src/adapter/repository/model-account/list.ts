import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IModelAccount } from '@/domain/entity/model-account'

type Params = Pick<AdapterParams, 'db'>

export type List = (data?: Prisma.ModelAccountFindManyArgs) => Promise<Array<IModelAccount> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    return (await db.client.modelAccount.findMany(data)) as Array<IModelAccount>
  }
}
