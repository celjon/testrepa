import { UseCaseParams } from '@/domain/usecase/types'
import { IShortcut } from '@/domain/entity/shortcut'
import { ForbiddenError, NotFoundError } from '@/domain/errors'

export type Delete = (data: { shortcutId: string; userId: string }) => Promise<IShortcut | never>

export const buildDelete = ({ adapter }: UseCaseParams): Delete => {
  return async ({ shortcutId, userId }) => {
    const usersShortcut = await adapter.shortcutRepository.get({
      where: {
        id: shortcutId,
        user_id: userId
      }
    })

    if (!usersShortcut) {
      throw new ForbiddenError()
    }

    const shortcut = await adapter.shortcutRepository.delete({
      where: {
        id: shortcutId
      }
    })

    if (!shortcut) {
      throw new NotFoundError()
    }

    return shortcut
  }
}
