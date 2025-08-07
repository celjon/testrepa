import { InvalidDataError, UnauthorizedError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import * as bcrypt from 'bcrypt'

export type ChangePassword = (params: {
  userId: string
  oldPassword: string
  newPassword: string
  ip: string
  user_agent: string | null
}) => Promise<{
  accessToken: string
  refreshToken: string
}>

export const buildChangePassword = ({ adapter, service }: UseCaseParams): ChangePassword => {
  return async ({ userId, oldPassword, newPassword, ip, user_agent }) => {
    const user = await adapter.userRepository.get({
      where: { id: userId },
    })

    if (!user || !user.email) {
      throw new InvalidDataError({
        code: 'PASSWORD_NOT_SET',
      })
    }

    if (oldPassword === newPassword) {
      throw new InvalidDataError({
        code: 'PASSWORD_CANT_BE_SAME',
      })
    }

    const isOldPasswordValid = await service.auth.checkCredentials({
      email: user.email,
      password: oldPassword,
    })
    if (!isOldPasswordValid) {
      throw new UnauthorizedError({
        code: 'INVALID_OLD_PASSWORD',
      })
    }

    const hash = await bcrypt.hash(newPassword, 10)
    let keyEncryptionKey: string | null = null
    if (user.encryptedDEK && user.kekSalt) {
      const oldKEK = await adapter.cryptoGateway.deriveKEK({
        password: oldPassword,
        kekSalt: user.kekSalt,
      })
      const dek = await adapter.cryptoGateway.decryptDEK({
        kek: oldKEK,
        edek: user.encryptedDEK,
      })

      const kekSalt = await adapter.cryptoGateway.generateKEKSalt()
      keyEncryptionKey = await adapter.cryptoGateway.deriveKEK({
        password: newPassword,
        kekSalt,
      })
      const encryptedDEK = await adapter.cryptoGateway.encryptDEK({
        kek: keyEncryptionKey,
        dek,
      })

      await adapter.userRepository.update({
        where: { id: userId },
        data: {
          password: hash,
          encryptedDEK,
          kekSalt,
        },
      })
    } else {
      await adapter.userRepository.update({
        where: { id: userId },
        data: {
          password: hash,
        },
      })
    }

    const tokens = await service.auth.signAuthTokens({
      user,
      keyEncryptionKey,
    })

    await adapter.refreshTokenRepository.deleteMany({
      where: { user_id: userId },
    })

    await adapter.refreshTokenRepository.create({
      data: { user_id: userId, token: tokens.refreshToken, ip, user_agent },
    })

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }
}
