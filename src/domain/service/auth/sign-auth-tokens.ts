import { IUser } from '@/domain/entity/user'
import { signJWT } from '@/lib'

export type signAuthTokens = (params: { user: IUser; immortal?: boolean; keyEncryptionKey: string | null }) => Promise<
  | {
      accessToken: string
      refreshToken: string
    }
  | never
>

export const buildSignAuthTokens = (): signAuthTokens => {
  return async ({ user, immortal = false, keyEncryptionKey }) => {
    return {
      accessToken: signJWT({
        id: user.id,
        keyEncryptionKey,
        ...(!immortal && { expiresIn: '24h' })
      }),
      refreshToken: signJWT({
        id: user.id,
        keyEncryptionKey,
        ...(!immortal && { expiresIn: '1y' })
      })
    }
  }
}
