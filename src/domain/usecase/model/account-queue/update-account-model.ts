import { IModelAccountModel } from '@/domain/entity/modelAccountModel'
import { UseCaseParams } from '@/domain/usecase/types'

export type UpdateAccountModel = (params: {
  id: string
  modelId?: string
  limit?: number
  usageCount?: number | null
  timeLimit?: string
  usageTime?: Date | null
  usageResetIntervalSeconds?: number | null
  accountId?: string
  disabled_at?: Date | null
}) => Promise<IModelAccountModel | null | never>

export const buildUpdateAccountModel =
  ({ adapter }: UseCaseParams): UpdateAccountModel =>
  async ({ id, modelId, limit, usageCount, timeLimit, usageTime, usageResetIntervalSeconds, accountId, disabled_at }) => {
    const modelAccountModel = await adapter.modelAccountModelRepository.update({
      where: { id },
      data: {
        ...(modelId && {
          model: {
            connect: {
              id: modelId
            }
          }
        }),
        limit,
        ...(usageCount === null && {
          usage_count: 0
        }),
        ...(typeof usageCount === 'number' && {
          usage_count: usageCount
        }),
        time_limit: timeLimit,
        ...(usageTime === null && {
          usage_time: new Date()
        }),
        ...(usageTime instanceof Date && {
          usage_time: usageTime
        }),
        ...(usageResetIntervalSeconds === null && {
          usage_reset_interval_seconds: usageResetIntervalSeconds
        }),
        ...(typeof usageResetIntervalSeconds === 'number' && {
          usage_reset_interval_seconds: usageResetIntervalSeconds
        }),
        ...(accountId && {
          account: {
            connect: {
              id: accountId
            }
          }
        }),
        disabled_at
      },
      include: {
        model: true
      }
    })

    return modelAccountModel
  }
