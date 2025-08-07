import { ModelAccountAuthType, ModelAccountModelStatus } from '@prisma/client'
import { Adapter } from '@/domain/types'
import { ModelAccountModelStatusReason } from '@/domain/entity/model-account-model'

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
          auth_type: ModelAccountAuthType.HAR_FILE,
        },
        usage_reset_interval_seconds: { not: null },
      },
    })

    const modelsToReset = accountModels.filter((model) => {
      if (model.disabled_at) {
        return false
      }

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

    const { count: availableModelsResetted } = await modelAccountModelRepository.updateMany({
      where: {
        id: {
          in: modelsToReset
            .filter(
              (model) =>
                model.status_reason !== ModelAccountModelStatusReason.G4F_MODEL_SUBSTITUTION,
            )
            .map((model) => model.id),
        },
      },
      data: {
        status: ModelAccountModelStatus.ACTIVE,
        usage_count: 0,
        usage_time: new Date(0),
        usage_resetted_at: new Date(),
        status_reason: 'USAGE_RESETTED',
      },
    })
    const { count: unavailableModelsResetted } = await modelAccountModelRepository.updateMany({
      where: {
        id: {
          in: modelsToReset
            .filter(
              (model) =>
                model.status === ModelAccountModelStatus.INACTIVE &&
                model.status_reason === ModelAccountModelStatusReason.G4F_MODEL_SUBSTITUTION,
            )
            .map((model) => model.id),
        },
      },
      data: {
        usage_count: 0,
        usage_time: new Date(0),
        usage_resetted_at: new Date(),
      },
    })

    return {
      resettedCount: availableModelsResetted + unavailableModelsResetted,
    }
  }
