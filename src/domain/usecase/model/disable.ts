import { Platform, Role } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'
import { IModel, ModelPlatform } from '@/domain/entity/model'
import { UseCaseParams } from '@/domain/usecase/types'

export type Disable = (p: {
  userId: string
  modelId: string
  platform?: ModelPlatform
}) => Promise<IModel | never>

export const buildDisable = ({ adapter, service }: UseCaseParams): Disable => {
  return async ({ userId, modelId, platform = Platform.API }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenError({
        message: "You don't have permission"
      })
    }

    const jobs = [
      await service.model.disable(modelId, platform),
      await service.plan.unsetDefaultModelGlobally({
        modelId
      })
    ]

    const [model] = await Promise.all(jobs)

    return model as IModel
  }
}
