import { Platform, Role } from '@prisma/client'
import { UseCaseParams } from '@/domain/usecase/types'
import { IModel, ModelPlatform } from '@/domain/entity/model'
import { ForbiddenError } from '@/domain/errors'

export type Enable = (p: {
  userId: string
  modelId: string
  platform?: ModelPlatform
}) => Promise<IModel | never>

export const buildEnable = ({ adapter, service }: UseCaseParams): Enable => {
  return async ({ userId, modelId, platform = Platform.API }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId,
      },
    })

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenError({
        message: "You don't have permission",
      })
    }

    const model = await service.model.enable(modelId, platform)

    return model
  }
}
