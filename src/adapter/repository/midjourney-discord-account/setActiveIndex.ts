import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'redis'>

export type SetActiveIndex = (params: { index: number }) => Promise<number>

export const buildSetActiveIndex =
  ({ redis }: Params): SetActiveIndex =>
  async ({ index }) => {
    await redis.client.main.hSet('midjourneyDiscordActiveAccountIndex', {
      index: index.toString()
    })

    return index
  }
