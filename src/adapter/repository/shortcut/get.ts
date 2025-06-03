import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IShortcut } from '@/domain/entity/shortcut'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.ShortcutFindFirstArgs) => Promise<IShortcut | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const chat = (await db.client.shortcut.findFirst(data)) as IShortcut

    return chat
  }
}
