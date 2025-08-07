import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'redis'>

export type GetLastSoftLimitNotification = (subscriptionId: string) => Promise<Date | null>

export const buildGetLastSoftLimitNotification = ({
  redis,
}: Params): GetLastSoftLimitNotification => {
  return async (id) => {
    const data = await redis.client.main.get(
      `subscription:${id}:last-softlimit-notification-timestamp`,
    )

    return data ? new Date(data) : null
  }
}

export type SetLastSoftLimitNotification = (
  subscriptionId: string,
  date: Date,
  ttlSec: number,
) => Promise<Date | null>

export const buildSetLastSoftLimitNotification = ({
  redis,
}: Params): SetLastSoftLimitNotification => {
  return async (id, date, ttlSec) => {
    const data = await redis.client.main.set(
      `subscription:${id}:last-softlimit-notification-timestamp`,
      date.getTime().toString(),
      {
        EX: ttlSec,
      },
    )

    return data ? new Date(data) : null
  }
}
