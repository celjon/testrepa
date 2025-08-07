import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'redis'>

export type DeleteG4FAccountRequest = (data: {
  accountId: string
  requestId: string
  cooldownUntil: Date
}) => Promise<void>

export const buildDeleteG4FAccountRequest = (params: Params): DeleteG4FAccountRequest => {
  const { redis } = params

  return async ({ accountId, requestId, cooldownUntil }) => {
    await redis.client.main.eval(
      `
      redis.call('DEL', 'g4f:account:' .. ARGV[1] .. ':requests:' .. ARGV[2])
      redis.call('SETEX', 'g4f:account:' .. ARGV[1] .. ':cooldown', 86400, ARGV[3])
    `,
      {
        keys: [],
        arguments: [accountId, requestId, cooldownUntil.getTime().toString()],
      },
    )
  }
}
