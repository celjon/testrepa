import { IModelCustom } from '@/domain/entity/modelCustom'
import { UseCaseParams } from '@/domain/usecase/types'

export type DeleteCustom = (params: { customId: string }) => Promise<IModelCustom | null | never>

export const buildDeleteCustom =
  ({ adapter }: UseCaseParams): DeleteCustom =>
  async ({ customId }) => {
    const modelCustom = await adapter.modelCustomRepository.delete({
      where: {
        id: customId
      }
    })

    const modelCustomization = await adapter.modelCustomRepository.list({
      orderBy: {
        order: 'asc'
      },
      select: {
        id: true,
        order: true
      }
    })

    await Promise.all(
      modelCustomization.map(({ id }, index) =>
        adapter.modelCustomRepository.update({
          where: {
            id
          },
          data: {
            order: index + 1
          }
        })
      )
    )

    return modelCustom
  }
