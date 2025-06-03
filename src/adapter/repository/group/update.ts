import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IGroup } from '@/domain/entity/group'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.GroupUpdateArgs) => Promise<IGroup | null | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const group = (await db.client.group.update(data)) as IGroup

    return group
  }
}
