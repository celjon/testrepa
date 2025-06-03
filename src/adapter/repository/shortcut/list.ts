import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IShortcut } from '@/domain/entity/shortcut'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.ShortcutFindManyArgs) => Promise<Array<IShortcut> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    const groups = (await db.client.shortcut.findMany(data)) as Array<IShortcut>

    return groups
  }
}
