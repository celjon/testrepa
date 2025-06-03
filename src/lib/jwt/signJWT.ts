import { config } from '@/config'
import jwt from 'jsonwebtoken'

type Props = {
  id?: string
  enterpriseId?: string
  expiresIn?: number | string
  isDeveloper?: boolean
  keyEncryptionKey?: string | null
  pythonBot?: boolean
}
export const signJWT = ({ id, enterpriseId, expiresIn, isDeveloper = false, keyEncryptionKey }: Props): string | never => {
  const secret = config.jwt.secret
  const options: Record<string, any> = {}

  if (expiresIn) {
    options.expiresIn = expiresIn
  }

  if (typeof secret === 'string') {
    return jwt.sign(
      {
        id,
        enterpriseId,
        isDeveloper,
        ...(keyEncryptionKey && { keyEncryptionKey })
      },
      secret,
      options
    )
  }
  throw new Error('Secret should be string')
}
