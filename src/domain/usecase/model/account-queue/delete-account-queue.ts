import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { config as cfg } from '@/config'

export type DeleteAccountQueue = (params: { id: string }) => Promise<void>

export const buildDeleteAccountQueue =
  ({ adapter }: UseCaseParams): DeleteAccountQueue =>
  async ({ id }) => {
    const modelAccountQueue = await adapter.modelAccountQueueRepository.get({
      where: { id },
      include: {
        accounts: {
          include: {
            g4f_har_file: true,
          },
        },
      },
    })

    if (!modelAccountQueue || !modelAccountQueue.accounts) {
      throw new NotFoundError({
        code: 'MODEL_ACCOUNT_QUEUE_NOT_FOUND',
      })
    }

    await Promise.all([
      adapter.modelAccountQueueRepository.deleteMany({
        where: { id },
      }),
      modelAccountQueue.accounts.map(async (modelAccount) => {
        if (
          modelAccount.g4f_har_file &&
          modelAccount.g4f_har_file.name &&
          modelAccount.g4f_api_url
        ) {
          await adapter.g4fGateway.deleteHarFile({
            name: modelAccount.g4f_har_file.name,
            apiUrl: modelAccount.g4f_api_url,
            harManagerUrl: cfg.model_providers.g4f.har_manager_url,
          })
        }

        await adapter.modelAccountRepository.deleteMany({
          where: { id },
        })
      }),
    ])
  }
