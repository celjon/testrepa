import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IGroup } from '@/domain/entity/group'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.GroupCreateArgs) => Promise<IGroup | never>
export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const group = (await db.client.group.create(data)) as IGroup

    return group
  }
}
