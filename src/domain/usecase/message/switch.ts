import { UseCaseParams } from '@/domain/usecase/types'
import { IMessage } from '@/domain/entity/message'
import { NotFoundError } from '@/domain/errors'

export type Switch = (data: {
  userId: string
  keyEncryptionKey: string | null
  id: string
  direction: 'next' | 'previous'
}) => Promise<IMessage>

export const buildSwitch = ({ adapter, service }: UseCaseParams): Switch => {
  return async ({ userId, keyEncryptionKey, id, direction }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId,
      },
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND',
      })
    }

    const nextOrPrevious = direction === 'next' ? 'next_version_id' : 'previous_version_id'

    const currentMessage = await service.message.storage.update({
      user,
      keyEncryptionKey,
      data: {
        where: {
          id,
          user_id: userId,
        },
        data: {
          choiced: false,
        },
      },
    })

    if (!currentMessage) {
      throw new NotFoundError({
        code: 'MESSAGE_NOT_FOUND',
        message: 'Message not found',
      })
    }

    if (!currentMessage[nextOrPrevious]) {
      throw new NotFoundError({
        code: 'MESSAGE_NOT_FOUND',
        message: `Message has no ${direction} version`,
      })
    }

    const nextMessage = await service.message.storage.update({
      user,
      keyEncryptionKey,
      data: {
        where: {
          id: currentMessage[nextOrPrevious]!,
          user_id: userId,
        },
        data: {
          choiced: true,
        },
        include: {
          model: {
            include: {
              icon: true,
              parent: {
                include: {
                  icon: true,
                },
              },
            },
          },
          set: true,
          transaction: true,
          images: {
            include: {
              original: true,
              preview: true,
              buttons: true,
            },
          },
          buttons: {
            where: {
              disabled: false,
            },
          },
          all_buttons: {
            distinct: ['action'],
          },
          attachments: {
            include: {
              file: true,
            },
          },
          voice: {
            include: {
              file: true,
            },
          },
          video: {
            include: {
              file: true,
            },
          },
        },
      },
    })

    if (!nextMessage) {
      throw new NotFoundError({
        code: 'MESSAGE_NOT_FOUND',
        message: `${direction} message not found`,
      })
    }

    return nextMessage
  }
}
