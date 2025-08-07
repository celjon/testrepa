import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'redis'>

export type AddG4FAccountRequest = (data: {
  accountId: string
  requestId: string
  ttlSeconds: number
}) => Promise<void>

export const buildAddG4FAccountRequest = (params: Params): AddG4FAccountRequest => {
  const { redis } = params

  return async ({ accountId, requestId, ttlSeconds }) => {
    await redis.client.main.eval(
      `
      redis.call('SETEX', 'g4f:account:' .. ARGV[1] .. ':requests:' .. ARGV[2], tonumber(ARGV[3]), ARGV[4])
      `,
      {
        keys: [],
        arguments: [accountId, requestId, ttlSeconds.toString(), Date.now().toString()],
      },
    )
  }
}
