import { ForbiddenError, InvalidDataError, NotFoundError, UnauthorizedError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'

export type EnableEncryption = (data: { userId: string; password: string }) => Promise<{
  accessToken: string
  refreshToken: string
}>

export const buildEnableEncryption = ({ service, adapter }: UseCaseParams): EnableEncryption => {
  const { cryptoGateway } = adapter

  return async ({ userId, password }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        password: true,
        useEncryption: true,
        encryptedDEK: true,
        kekSalt: true,
      },
    })

    if (!user) {
      throw new NotFoundError({ code: 'USER_NOT_FOUND' })
    }
    if (!user.email || !user.password) {
      throw new InvalidDataError({ code: 'PASSWORD_NOT_SET' })
    }

    const passwordIsValid = await service.auth.checkCredentials({
      email: user.email,
      password,
    })
    if (!passwordIsValid) {
      throw new UnauthorizedError({ code: 'INVALID_PASSWORD' })
    }

    if (user.useEncryption || user.encryptedDEK || user.kekSalt) {
      throw new ForbiddenError({ code: 'ALREADY_USING_ENCRYPTION' })
    }

    const kekSalt = await cryptoGateway.generateKEKSalt()
    const keyEncryptionKey = await cryptoGateway.deriveKEK({
      password,
      kekSalt,
    })
    const dek = await cryptoGateway.generateDEK()
    const encryptedDEK = await cryptoGateway.encryptDEK({
      kek: keyEncryptionKey,
      dek,
    })

    await adapter.userRepository.update({
      where: {
        id: userId,
      },
      data: {
        useEncryption: true,
        encryptedDEK,
        kekSalt,
      },
    })

    const tokens = await service.auth.signAuthTokens({
      user,
      keyEncryptionKey,
    })

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }
}
