import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { config as cfg } from '@/config'
import { logger } from '@/lib/logger'

export type DeleteAccount = (params: { id: string }) => Promise<void>

export const buildDeleteAccount = ({ adapter }: UseCaseParams): DeleteAccount => {
  return async ({ id }) => {
    const modelAccount = await adapter.modelAccountRepository.get({
      where: { id },
      include: {
        g4f_har_file: true,
      },
    })

    if (!modelAccount) {
      throw new NotFoundError({
        code: 'MODEL_ACCOUNT_NOT_FOUND',
      })
    }

    if (modelAccount.mj_channel_id) {
      await adapter.midjourneyGateway.account.remove({
        id: modelAccount.id,
      })
    }

    if (modelAccount.g4f_har_file && modelAccount.g4f_har_file.name && modelAccount.g4f_api_url) {
      await adapter.g4fGateway
        .deleteHarFile({
          name: modelAccount.g4f_har_file.name,
          apiUrl: modelAccount.g4f_api_url,
          harManagerUrl: cfg.model_providers.g4f.har_manager_url,
        })
        .catch((err) => {
          logger.warn(`error deleting har file for account ${id}: ${err}`)
        })
    }

    await adapter.modelAccountRepository.deleteMany({
      where: { id },
    })
  }
}
