import { Adapter } from '../../types'
import { ForbiddenError } from '@/domain/errors'

export type SetDisable = (data: { userId: string; disable: boolean }) => Promise<void>

export const buildSetDisable = ({ userRepository }: Adapter): SetDisable => {
  return async ({ userId, disable }) => {
    const user = await userRepository.get({
      where: {
        id: userId
      }
    })
    if (!user) {
      throw new ForbiddenError()
    }
    await userRepository.update({
      where: {
        id: userId
      },
      data: {
        disabled: disable
      }
    })
  }
}
