import { IUser } from '@/domain/entity/user'
import { Adapter } from '../../types'

export type UnlinkAccount = (params: {
  user: IUser
  onUnlinkComplete: (user: IUser) => Promise<void | never>
}) => Promise<IUser | null | never>

export const buildUnlinkAccount = ({ userRepository, transactor }: Adapter): UnlinkAccount => {
  return async ({ user, onUnlinkComplete }) => {
    const updatedUser = await transactor.inTx(
      async (tx) => {
        const updatedUser = await userRepository.update(
          {
            where: { id: user.id },
            data: {
              tg_id: null,
              tg_id_before: user.tg_id,
            },
            include: { subscription: { include: { plan: true } } },
          },
          tx,
        )

        await onUnlinkComplete(updatedUser as IUser)

        return updatedUser
      },
      {
        timeout: 10000,
      },
    )

    return updatedUser as IUser
  }
}
