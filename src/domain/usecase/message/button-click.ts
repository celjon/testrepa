import { UseCaseParams } from '../types'
import { InvalidDataError, NotFoundError } from '@/domain/errors'
import { IMessageButton } from '@/domain/entity/messageButton'
import { MessageButtonAction, MessageButtonType } from '@prisma/client'

export type ButtonClick = (params: { buttonId: string; userId: string; keyEncryptionKey: string | null }) => Promise<IMessageButton>

export const buildButtonClick =
  ({ adapter, service }: UseCaseParams): ButtonClick =>
  async ({ buttonId, userId, keyEncryptionKey }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }

    const button = await adapter.messageButtonRepository.get({
      where: {
        id: buttonId,
        message: {
          user: {
            id: userId
          }
        }
      },
      include: {
        message: {
          include: {
            model: true,
            chat: {
              include: {
                user: true,
                model: true,
                settings: {
                  include: {
                    mj: true
                  }
                }
              }
            },
            voice: {
              include: {
                file: true
              }
            }
          }
        }
      }
    })

    if (!button) {
      throw new NotFoundError({
        code: 'MESSAGE_BUTTON_NOT_FOUND'
      })
    }

    if (button.type === MessageButtonType.BUTTON) {
      if (button.action === MessageButtonAction.DOWNLOAD) {
        return button
      } else {
        throw new InvalidDataError({
          code: 'INVALID_MESSAGE_BUTTON_ACTION'
        })
      }
    } else {
      if (button.message?.chat?.model) {
        await service.model.incrementUsage({
          modelIds: [button.message.chat.model.id]
        })
      }

      await service.message.midjourney.buttonClick({
        button,
        user,
        keyEncryptionKey
      })
    }

    return button
  }
