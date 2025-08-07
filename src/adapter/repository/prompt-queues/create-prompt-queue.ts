import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'redis'>
export type CreatePromptQueue = (args: {
  userId: string
  cancelFn: () => void
  maxQueuesPerUser: number
}) => Promise<string>

export const buildCreatePromptQueue = ({ redis }: Params): CreatePromptQueue => {
  return async ({ userId, cancelFn, maxQueuesPerUser }) => {
    const setKey = `promptQueues:${userId}`

    const count = await redis.client.main.sCard(setKey)
    if (count >= maxQueuesPerUser) {
      throw new Error(`Превышен лимит ${maxQueuesPerUser} активных очередей`)
    }

    const queueId = crypto.randomUUID()

    await redis.client.main.sAdd(setKey, queueId)
    const expire = 12 * 60 * 60 //12 hours
    await redis.client.main.expire(setKey, expire)

    redis.client.cancelFns[queueId] = cancelFn

    return queueId
  }
}
