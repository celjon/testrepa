import { IModelCustom } from '@/domain/entity/modelCustom'
import { UseCaseParams } from '@/domain/usecase/types'

export type GetCustomization = () => Promise<Array<IModelCustom> | never>

export const buildGetCustomization =
  ({ adapter }: UseCaseParams): GetCustomization =>
  async () => {
    const modelCustomization = await adapter.modelCustomRepository.list({
      orderBy: {
        order: 'asc'
      },
      include: {
        icon: true,
        provider: true,
        child_provider: true
      }
    })

    return modelCustomization
  }
