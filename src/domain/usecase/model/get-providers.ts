import { IModelProvider } from '@/domain/entity/model-provider'
import { UseCaseParams } from '@/domain/usecase/types'

export type GetProviders = (params: {
  disabled?: boolean
  supportedAccounts?: boolean
}) => Promise<Array<IModelProvider> | never>

export const buildGetProviders =
  ({ adapter }: UseCaseParams): GetProviders =>
  async ({ disabled, supportedAccounts }) => {
    const modelProviders = await adapter.modelProviderRepository.list({
      where: {
        parent_id: null,
        disabled,
        supported_accounts: supportedAccounts,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        fallback: true,
        children: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    return modelProviders
  }
