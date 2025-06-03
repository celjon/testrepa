import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IGroup } from '@/domain/entity/group'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.GroupFindManyArgs) => Promise<Array<IGroup> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    const groups = (await db.client.group.findMany(data)) as Array<IGroup>

    return groups
  }
}
