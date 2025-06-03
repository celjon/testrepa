import { IUser } from '@/domain/entity/user'
import { UseCaseParams } from '@/domain/usecase/types'
import { InvalidDataError, NotFoundError } from '@/domain/errors'
import { verifyJWT } from '@/lib'
import { JwtPayload } from 'jsonwebtoken'

export type UnlinkTelegram = (data: { telegramUnlinkToken: string }) => Promise<IUser | never>
export const buildUnlinkTelegram = ({ service, adapter }: UseCaseParams): UnlinkTelegram => {
  return async ({ telegramUnlinkToken }) => {
    const tokenPayload = verifyJWT(telegramUnlinkToken) as JwtPayload & {
      id: string
    }

    const user = await adapter.userRepository.get({
      where: { id: tokenPayload.id },
      include: {
        subscription: { include: { plan: true } },
        referral_participants: true
      }
    })

    if (!user || !user.subscription) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }

    if (!tokenPayload.id) {
      throw new InvalidDataError({
        code: 'INVALID_TELEGRAM_UNLINK_TOKEN'
      })
    }

    const updatedUser = await service.user.unlinkAccount({
      user: user,
      onUnlinkComplete: async (user) => {
        await adapter.authRepository.unlinkAccountInTgBot({
          type: 'unlink',
          email: user.email
        })
      }
    })

    return updatedUser as IUser
  }
}
