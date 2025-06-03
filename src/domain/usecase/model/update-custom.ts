import { IModelCustom } from '@/domain/entity/modelCustom'
import { UseCaseParams } from '@/domain/usecase/types'
import { FileType, ModelCustomAction } from '@prisma/client'

type Icon = {
  size: number
  path: string
  originalname: string
  buffer: Buffer
}

export type UpdateCustom = (params: {
  customId: string
  action?: ModelCustomAction
  modelId?: string
  childModelId?: string
  label?: string
  icon?: 'not-update' | Icon
  providerId?: string
  childProviderId?: string
  messageColor?: string
  order?: number
  discount?: number
  disabled?: boolean
}) => Promise<IModelCustom | null | never>

export const buildUpdateCustom =
  ({ adapter }: UseCaseParams): UpdateCustom =>
  async ({
    customId,
    action,
    modelId,
    childModelId,
    label,
    icon,
    providerId,
    childProviderId,
    messageColor,
    discount,
    order,
    disabled
  }) => {
    if (order) {
      const modelCustom = await adapter.modelCustomRepository.get({
        where: {
          id: customId
        }
      })
      const orderModelCustom = await adapter.modelCustomRepository.get({
        where: {
          order
        }
      })

      if (modelCustom && orderModelCustom) {
        await adapter.modelCustomRepository.update({
          where: {
            id: orderModelCustom.id
          },
          data: {
            order: modelCustom.order
          }
        })
      }
    }

    const modelCustom = await adapter.modelCustomRepository.update({
      where: {
        id: customId
      },
      data: {
        action,
        model_id: modelId ?? null,
        child_model_id: childModelId ?? null,
        label: label ?? null,
        discount,
        ...(icon &&
          icon !== 'not-update' && {
            icon: {
              create: {
                type: FileType.IMAGE,
                name: icon.originalname,
                path: icon.path
              }
            }
          }),
        ...(!icon && {
          icon: {
            disconnect: true
          }
        }),
        ...(providerId && {
          provider: {
            connect: {
              id: providerId
            }
          }
        }),
        ...(!providerId && {
          provider: {
            disconnect: true
          }
        }),
        ...(childProviderId && {
          child_provider: {
            connect: {
              id: childProviderId
            }
          }
        }),
        ...(!childProviderId && {
          child_provider: {
            disconnect: true
          }
        }),
        message_color: messageColor ?? null
      },
      ...(order && {
        data: {
          order
        }
      }),
      ...(typeof disabled === 'boolean' && {
        data: {
          disabled
        }
      })
    })

    if (order) {
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
    }

    return modelCustom
  }
