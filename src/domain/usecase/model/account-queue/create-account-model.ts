import { IModelAccountModel } from '@/domain/entity/modelAccountModel'
import { UseCaseParams } from '@/domain/usecase/types'

export type CreateAccountModel = (params: {
  modelId: string
  limit: number
  timeLimit: string
  usageResetIntervalSeconds?: number | null
  accountId: string
  disabled_at?: Date | null
}) => Promise<IModelAccountModel | null | never>

export const buildCreateAccountModel =
  ({ adapter }: UseCaseParams): CreateAccountModel =>
  async ({ modelId, limit, timeLimit, usageResetIntervalSeconds, accountId, disabled_at }) => {
    const modelAccountModel = await adapter.modelAccountModelRepository.create({
      data: {
        model: {
          connect: {
            id: modelId
          }
        },
        limit,
        time_limit: timeLimit,
        usage_time: new Date(0),
        usage_reset_interval_seconds: usageResetIntervalSeconds,
        account: {
          connect: {
            id: accountId
          }
        },
        disabled_at
      },
      include: {
        model: true
      }
    })

    return modelAccountModel
  }
