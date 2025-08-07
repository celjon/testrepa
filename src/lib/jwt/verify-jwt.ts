import jwt, { JwtPayload } from 'jsonwebtoken'
import { config } from '@/config'

export const verifyJWT = (
  token: string,
  options?: {
    ignoreExpiration: boolean
  },
): JwtPayload | string => {
  const secret = config.jwt.secret
  try {
    const data = jwt.verify(token, secret as string, options)
    return data
  } catch (e) {
    return {
      id: null,
    }
  }
}
