import { UseCaseParams } from '../types'
import jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { config } from '@/config'
import { ForbiddenError } from '@/domain/errors'

export type ResetPassword = (data: { token: string; password: string }) => Promise<void | never>
export const buildResetPassword = ({ adapter }: UseCaseParams): ResetPassword => {
  return async ({ token, password }) => {
    const payload = jwt.decode(token) as {
      userId: string
    }
    const userId = payload?.userId

    if (!userId) {
      throw new ForbiddenError({
        code: 'INVALID_TOKEN'
      })
    }

    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (!user) {
      throw new ForbiddenError({
        code: 'INVALID_TOKEN'
      })
    }

    const secret = config.jwt.secret + user.password
    jwt.verify(token, secret)

    const newPassword = await bcrypt.hash(password, 10)

    await adapter.userRepository.update({
      where: {
        id: userId
      },
      data: {
        password: newPassword,
        useEncryption: false,
        encryptedDEK: null,
        kekSalt: null,
      }
    })

    return
  }
}
