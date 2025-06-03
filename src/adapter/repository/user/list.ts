import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IUser } from '@/domain/entity/user'

type Params = Pick<AdapterParams, 'db'>

export type List = (params: Prisma.UserFindManyArgs) => Promise<Array<IUser> | never>
export const buildList = ({ db }: Params): List => {
  return async (getParams) => {
    const user = (await db.client.user.findMany(getParams)) as Array<IUser>

    return user
  }
}
