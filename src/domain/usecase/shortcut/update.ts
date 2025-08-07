import { UseCaseParams } from '@/domain/usecase/types'
import { IShortcut } from '@/domain/entity/shortcut'
import { ForbiddenError, NotFoundError } from '@/domain/errors'

export type Update = (data: {
  userId: string
  shortcutId: string
  text?: string
  name?: string
  autosend?: boolean
}) => Promise<IShortcut | never>

export const buildUpdate = ({ adapter }: UseCaseParams): Update => {
  return async ({ userId, shortcutId, text, name, autosend }) => {
    const usersShortcut = await adapter.shortcutRepository.get({
      where: {
        id: shortcutId,
        user_id: userId,
      },
    })

    if (!usersShortcut) {
      throw new ForbiddenError()
    }

    const shortcut = await adapter.shortcutRepository.update({
      where: {
        id: shortcutId,
      },
      data: {
        text,
        name,
        autosend,
      },
    })

    if (!shortcut) {
      throw new NotFoundError()
    }

    return shortcut
  }
}
