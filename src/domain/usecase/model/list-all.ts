import { UseCaseParams } from '@/domain/usecase/types'
import { IModel } from '@/domain/entity/model'

export type ListAll = () => Promise<Array<IModel> | never>

export const buildListAll = ({ adapter }: UseCaseParams): ListAll => {
  return async () => {
    const models = await adapter.modelRepository.list({
      orderBy: {
        order: 'asc'
      },
      include: {
        icon: true,
        parent: true,
        functions: true,
        provider: true,
        child_provider: true,
        providers: true
      }
    })

    return models
  }
}
