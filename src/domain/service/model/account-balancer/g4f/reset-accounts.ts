import { Adapter } from '@/domain/types'

type Params = Adapter

export type ResetAccounts = () => Promise<{
  resettedCount: number
}>

export const buildResetAccounts =
  ({ modelAccountRepository }: Params): ResetAccounts =>
  async () => {
    const accounts = await modelAccountRepository.list({
      where: {
        usage_reset_interval_seconds: { not: null },
      },
    })

    const accountsToReset = accounts.filter((model) => {
      if (model.usage_reset_interval_seconds === null) {
        return false
      }

      if (model.usage_resetted_at === null) {
        return true
      }

      return (
        model.usage_resetted_at.getTime() + model.usage_reset_interval_seconds * 1000 <=
        new Date().getTime()
      )
    })

    const { count } = await modelAccountRepository.updateMany({
      where: {
        id: { in: accountsToReset.map((model) => model.id) },
      },
      data: {
        usage_count: 0,
        usage_resetted_at: new Date(),
      },
    })

    return {
      resettedCount: count,
    }
  }
