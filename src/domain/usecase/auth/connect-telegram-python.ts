import { verifyJWT } from '@/lib'
import { JwtPayload } from 'jsonwebtoken'
import { UseCaseParams } from '@/domain/usecase/types'
import { IUser } from '@/domain/entity/user'
import { InvalidDataError, NotFoundError } from '@/domain/errors'

export type ConnectTelegramPython = (data: { telegramConnectionToken: string; userId: string }) => Promise<IUser | never>

export const buildConnectTelegramPython = ({ service, adapter }: UseCaseParams): ConnectTelegramPython => {
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

    const tokenPayload = verifyJWT(telegramConnectionToken) as JwtPayload & {
      id: string
      pythonBot?: boolean
    }

    if (!tokenPayload.id) {
      throw new InvalidDataError({
        code: 'INVALID_TELEGRAM_CONNECTION_TOKEN'
      })
    }

    // Проверяем, что токен именно для Python-бота
    if (!tokenPayload.pythonBot) {
      throw new InvalidDataError({
        code: 'INVALID_TOKEN_TYPE'
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

    const updatedUser = await service.user.mergeAccounts({
      from: telegramUser,
      to: user,
      onMergeComplete: async (user) => {
        await adapter.authRepository.mergeAccountsInTgBot({
          type: 'merge',
          oldId: telegramUser.id,
          newId: user.id,
          email: user.email,
          pythonBot: true
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
