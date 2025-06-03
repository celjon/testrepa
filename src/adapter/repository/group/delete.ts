import { AdapterParams } from '@/adapter/types'
import { IGroup } from '@/domain/entity/group'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.GroupDeleteArgs) => Promise<IGroup | never>
export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const group = (await db.client.group.delete(data)) as IGroup

    return group
  }
}
