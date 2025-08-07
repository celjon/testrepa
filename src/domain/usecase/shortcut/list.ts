import { UseCaseParams } from '@/domain/usecase/types'
import { IShortcut } from '@/domain/entity/shortcut'

export type List = (data: { userId: string }) => Promise<Array<IShortcut> | never>

export const buildList = ({ adapter }: UseCaseParams): List => {
  return async ({ userId }) => {
    const shortcuts = await adapter.shortcutRepository.list({
      where: {
        user_id: userId,
      },
    })

    return shortcuts
  }
}
