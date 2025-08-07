import { signJWT } from '@/lib'

export type signAuthTokens = (params: {
  user: {
    id: string
  }
  immortal?: boolean
  keyEncryptionKey: string | null
  short?: boolean
}) => Promise<
  | {
      accessToken: string
      refreshToken: string
    }
  | never
>

export const buildSignAuthTokens = (): signAuthTokens => {
  return async ({ user, immortal = false, keyEncryptionKey, short = false }) => {
    let accessTokenExpiresIn = { expiresIn: '15m' }
    let refreshTokenExpiresIn = { expiresIn: '1y' }
    if (short) {
      accessTokenExpiresIn = { expiresIn: '24h' }
      refreshTokenExpiresIn = { expiresIn: '24h' }
    }

    return {
      accessToken: signJWT({
        id: user.id,
        keyEncryptionKey,
        ...(!immortal && accessTokenExpiresIn),
      }),
      refreshToken: signJWT({
        id: user.id,
        ...(!immortal && refreshTokenExpiresIn),
      }),
    }
  }
}
