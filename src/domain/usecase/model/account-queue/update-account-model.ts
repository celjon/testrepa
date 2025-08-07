import { ModelAccountModelStatus } from '@prisma/client'
import { IModelAccountModel } from '@/domain/entity/model-account-model'
import { UseCaseParams } from '@/domain/usecase/types'
import { NotFoundError } from '@/domain/errors'

export type UpdateAccountModel = (params: {
  id: string
  modelId?: string
  limit?: number
  usageCount?: number | null
  timeLimit?: string
  usageTime?: Date | null
  usageResetIntervalSeconds?: number | null
  accountId?: string
  status?: ModelAccountModelStatus
  disabled_at?: Date | null
}) => Promise<IModelAccountModel | null | never>

export const buildUpdateAccountModel =
  ({ adapter }: UseCaseParams): UpdateAccountModel =>
  async ({
    id,
    modelId,
    limit,
    usageCount,
    timeLimit,
    usageTime,
    usageResetIntervalSeconds,
    accountId,
    status,
    disabled_at,
  }) => {
    let modelAccountModel = await adapter.modelAccountModelRepository.get({
      where: { id },
    })

    if (!modelAccountModel) {
      throw new NotFoundError({
        code: 'MODEL_ACCOUNT_MODEL_NOT_FOUND',
      })
    }

    modelAccountModel = await adapter.modelAccountModelRepository.update({
      where: { id },
      data: {
        ...(modelId && {
          model: {
            connect: {
              id: modelId,
            },
          },
        }),
        limit,
        ...(usageCount === null && {
          usage_count: 0,
        }),
        ...(typeof usageCount === 'number' && {
          usage_count: usageCount,
        }),
        time_limit: timeLimit,
        ...(usageTime === null && {
          usage_time: new Date(),
        }),
        ...(usageTime instanceof Date && {
          usage_time: usageTime,
        }),
        ...(usageResetIntervalSeconds === null && {
          usage_reset_interval_seconds: usageResetIntervalSeconds,
        }),
        ...(typeof usageResetIntervalSeconds === 'number' && {
          usage_reset_interval_seconds: usageResetIntervalSeconds,
        }),
        ...(accountId && {
          account: {
            connect: {
              id: accountId,
            },
          },
        }),
        status,
        ...(status && { status_reason: status === modelAccountModel.status ? undefined : null }),
        disabled_at,
      },
      include: {
        model: true,
      },
    })

    return modelAccountModel
  }
