import { IModelCustom } from '@/domain/entity/modelCustom'
import { UseCaseParams } from '@/domain/usecase/types'
import { FileType, ModelCustomAction } from '@prisma/client'

type Icon = {
  size: number
  path: string
  originalname: string
  buffer: Buffer
}

export type CreateCustom = (params: {
  action: ModelCustomAction
  modelId: string
  childModelId?: string
  label?: string
  icon?: Icon
  providerId?: string
  childProviderId?: string
  messageColor?: string
  discount?: number
  disabled?: boolean
}) => Promise<IModelCustom | null | never>

export const buildCreateCustom =
  ({ adapter }: UseCaseParams): CreateCustom =>
  async ({ action, modelId, childModelId, label, icon, providerId, childProviderId, messageColor, discount, disabled }) => {
    const order = (await adapter.modelCustomRepository.count()) + 1

    const modelCustom = await adapter.modelCustomRepository.create({
      data: {
        action,
        model_id: modelId,
        child_model_id: childModelId,
        label,
        ...(icon && {
          icon: {
            create: {
              type: FileType.IMAGE,
              name: icon.originalname,
              path: icon.path
            }
          }
        }),
        ...(providerId && {
          provider: {
            connect: {
              id: providerId
            }
          }
        }),
        ...(childProviderId && {
          child_provider: {
            connect: {
              id: childProviderId
            }
          }
        }),
        message_color: messageColor,
        discount,
        order,
        disabled
      }
    })

    return modelCustom
  }
