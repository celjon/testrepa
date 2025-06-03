import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'redis'>

export type GetActiveIndex = () => Promise<number>

export const buildGetActiveIndex =
  ({ redis }: Params): GetActiveIndex =>
  async () => {
    const result = await redis.client.main.hGetAll('midjourneyDiscordActiveAccountIndex')

    return +(result.index ?? 0)
  }
