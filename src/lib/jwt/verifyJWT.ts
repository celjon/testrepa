import jwt, { JwtPayload } from 'jsonwebtoken'
import { config } from '@/config'

export const verifyJWT = (token: string): JwtPayload | string => {
  const secret = config.jwt.secret
  try {
    const data = jwt.verify(token, secret as string)
    return data
  } catch (e) {
    return {
      id: null
    }
  }
}
