import { UseCaseParams } from '@/domain/usecase/types'
import { IShortcut } from '@/domain/entity/shortcut'

export type Create = (data: {
  userId: string
  text: string
  name: string
  autosend: boolean
}) => Promise<IShortcut | never>

export const buildCreate = ({ adapter }: UseCaseParams): Create => {
  return async ({ text, name, autosend, userId }) => {
    const newShortcut = await adapter.shortcutRepository.create({
      data: {
        user_id: userId,
        name: name,
        text: text,
        autosend: autosend,
      },
    })

    return newShortcut
  }
}
