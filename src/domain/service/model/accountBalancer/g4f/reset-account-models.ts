import { ModelAccountAuthType } from '@prisma/client'
import { Adapter } from '@/domain/types'

type Params = Adapter

export type ResetAccountModels = () => Promise<{
  resettedCount: number
}>

export const buildResetAccountModels =
  ({ modelAccountModelRepository }: Params): ResetAccountModels =>
  async () => {
    const accountModels = await modelAccountModelRepository.list({
      where: {
        account: {
          auth_type: ModelAccountAuthType.HAR_FILE
        },
        usage_reset_interval_seconds: { not: null }
      }
    })

    const idsToReset = accountModels
      .filter((model) => {
        if (model.usage_reset_interval_seconds === null) {
          return false
        }

        if (model.usage_resetted_at === null) {
          return true
        }

        return model.usage_resetted_at.getTime() + model.usage_reset_interval_seconds * 1000 <= new Date().getTime()
      })
      .map((model) => model.id)

    const { count } = await modelAccountModelRepository.updateMany({
      where: {
        id: { in: idsToReset }
      },
      data: {
        disabled_at: null,
        usage_count: 0,
        usage_time: new Date(0),
        usage_resetted_at: new Date()
      }
    })

    return {
      resettedCount: count
    }
  }
