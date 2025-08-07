import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'redis'>

export type GetQueue = (args: { userId: string; queueId: string }) => Promise<{
  queueId: string
  expiresAt?: number
} | null>

export const buildGetQueue = ({ redis }: Params): GetQueue => {
  return async ({ userId, queueId }) => {
    const setKey = `promptQueues:${userId}`

    const isMember = await redis.client.main.sIsMember(setKey, queueId)
    if (!isMember) {
      return null
    }

    const ttlMs = await redis.client.main.pTTL(setKey)
    const expiresAt = ttlMs >= 0 ? Date.now() + ttlMs : undefined

    return {
      queueId,
      expiresAt,
    }
  }
}
