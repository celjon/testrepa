import { signJWT } from '@/lib'
import { Adapter } from '../../types'
import { IDeveloperKey } from '@/domain/entity/developer-key'

export type Create = (params: { userId: string; label?: string }) => Promise<IDeveloperKey>

export const buildCreate = ({ developerKeyRepository }: Adapter): Create => {
  return async ({ userId, label }) => {
    const hash = signJWT({
      id: userId,
      expiresIn: '10y',
      isDeveloper: true,
      keyEncryptionKey: null,
    })

    const key = await developerKeyRepository.create({
      data: {
        user_id: userId,
        label,
        key: hash,
      },
    })

    return key
  }
}
