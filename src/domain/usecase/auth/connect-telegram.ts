import { verifyJWT } from '@/lib'
import { JwtPayload } from 'jsonwebtoken'
import { UseCaseParams } from '@/domain/usecase/types'
import { IUser } from '@/domain/entity/user'
import { ForbiddenError, InvalidDataError, NotFoundError } from '@/domain/errors'

export type ConnectTelegram = (data: { telegramConnectionToken: string; userId: string }) => Promise<IUser | never>
export const buildConnectTelegram = ({ service, adapter }: UseCaseParams): ConnectTelegram => {
  return async ({ telegramConnectionToken, userId }) => {
    const user = await adapter.userRepository.get({
      where: { id: userId },
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
    if (user.tg_id) {
      throw new ForbiddenError({
        code: 'TELEGRAM_ALREADY_CONNECTED'
      })
    }

    const tokenPayload = verifyJWT(telegramConnectionToken) as JwtPayload & {
      id: string
    }

    if (!tokenPayload.id) {
      throw new InvalidDataError({
        code: 'INVALID_TELEGRAM_CONNECTION_TOKEN'
      })
    }
    const telegramUser = await adapter.userRepository.get({
      where: { id: tokenPayload.id },
      include: { subscription: { include: { plan: true } } }
    })

    if (!telegramUser || !telegramUser.subscription) {
      throw new NotFoundError({
        code: 'TELEGRAM_USER_NOT_FOUND'
      })
    }
    if (telegramUser.email) {
      throw new ForbiddenError({
        code: 'TELEGRAM_ALREADY_CONNECTED'
      })
    }

    const updatedUser = await service.user.mergeAccounts({
      from: telegramUser,
      to: user,
      onMergeComplete: async (user) => {
        await adapter.authRepository.mergeAccountsInTgBot({
          type: 'merge',
          oldId: telegramUser.id,
          newId: user.id,
          email: user.email
        })
      }
    })

    if (updatedUser) {
      updatedUser.encryptedDEK = null
      updatedUser.kekSalt = null
      updatedUser.password = null
    }

    return updatedUser as IUser
  }
}
