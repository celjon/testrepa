import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IGroup } from '@/domain/entity/group'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.GroupFindFirstArgs) => Promise<IGroup | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const group = (await db.client.group.findFirst(data)) as IGroup

    return group
  }
}
