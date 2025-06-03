import { IShortcut } from '@/domain/entity/shortcut'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.ShortcutUpdateArgs) => Promise<IShortcut | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const chat = (await db.client.shortcut.update(data)) as IShortcut

    return chat
  }
}
