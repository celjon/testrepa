import { IShortcut } from '@/domain/entity/shortcut'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type ShortcurRepositoryCreate = (data: Prisma.ShortcutCreateArgs) => Promise<IShortcut | never>
export const buildCreate = ({ db }: Params): ShortcurRepositoryCreate => {
  return async (data) => {
    const chat = (await db.client.shortcut.create(data)) as IShortcut

    return chat
  }
}
