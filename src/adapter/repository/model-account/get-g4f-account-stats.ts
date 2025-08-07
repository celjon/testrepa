import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'redis'>

export type GetG4FAccountStats = (accountId: string) => Promise<{
  activeRequestsCount: number
  cooldownUntil: Date | null
}>

export const buildGetG4FAccountStats = (params: Params): GetG4FAccountStats => {
  const { redis } = params

  return async (accountId) => {
    const result = (await redis.client.main.eval(
      `
      local active_requests = redis.call('KEYS', 'g4f:account:' .. ARGV[1] .. ':requests:*')
      local cooldown_until = redis.call('GET', 'g4f:account:' .. ARGV[1] .. ':cooldown')
      return {#active_requests, cooldown_until}
    `,
      {
        keys: [],
        arguments: [accountId],
      },
    )) as [number, string | null]

    return {
      activeRequestsCount: result[0],
      cooldownUntil: result[1] ? new Date(parseInt(result[1])) : null,
    }
  }
}
