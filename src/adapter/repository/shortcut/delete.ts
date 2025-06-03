import { IShortcut } from '@/domain/entity/shortcut'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.ShortcutDeleteArgs) => Promise<IShortcut | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const chat = (await db.client.shortcut.delete(data)) as IShortcut

    return chat
  }
}
