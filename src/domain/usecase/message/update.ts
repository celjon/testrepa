import { UseCaseParams } from '@/domain/usecase/types'
import { IMessage } from '@/domain/entity/message'
import { ForbiddenError, NotFoundError } from '@/domain/errors'

const maxAllowedSetLength = 5

export type Update = (data: {
  userId: string
  keyEncryptionKey: string | null
  id: string
  content: string
}) => Promise<IMessage>

export const buildUpdate = ({ adapter, service }: UseCaseParams): Update => {
  return async ({ userId, keyEncryptionKey, id, content }) => {
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

    return adapter.transactor.inTx(async (tx) => {
      let currentMessage = await service.message.storage.get(
        {
          user,
          keyEncryptionKey,
          data: {
            where: {
              id: id,
              user_id: userId,
              choiced: true,
            },
            include: {
              set: {
                include: {
                  last: true,
                },
              },
            },
          },
        },
        tx,
      )

      if (!currentMessage) {
        throw new NotFoundError({
          code: 'MESSAGE_NOT_FOUND',
        })
      }

      let set

      // create messageSet if not exists
      if (!currentMessage.set) {
        set = await adapter.messageSetRepository.create(
          {
            data: {
              chat_id: currentMessage.chat_id,
              last_id: currentMessage.id,
              choiced: currentMessage.id,
            },
            include: {
              last: true,
            },
          },
          tx,
        )
      } else {
        set = currentMessage.set

        if (set.length >= maxAllowedSetLength) {
          throw new ForbiddenError({
            code: 'MESSAGE_SET_LIMIT_REACHED',
            message: 'Message regeneration limit reached',
            data: {
              maxAllowedSetLength,
            },
          })
        }
      }

      if (!set.last) {
        throw new NotFoundError()
      }

      const lastMessage = set.last

      // remove all links from current message
      if (currentMessage.previous_version_id || currentMessage.next_version_id) {
        await service.message.storage.update(
          {
            user,
            keyEncryptionKey,
            data: {
              where: { id: currentMessage.id, user_id: userId },
              data: {
                previous_version_id: null,
                next_version_id: null,
              },
            },
          },
          tx,
        )
      }

      // create new message with the same links as current message
      const oldMessage = await service.message.storage.create(
        {
          user,
          keyEncryptionKey,
          data: {
            data: {
              content: currentMessage.content,
              full_content: currentMessage.full_content,
              role: currentMessage.role,
              chat_id: currentMessage.chat_id,
              user_id: currentMessage.user_id,
              version: currentMessage.version,
              set_id: set.id,
              choiced: false,
              created_at: currentMessage.created_at,
              previous_version_id: currentMessage.previous_version_id,
              next_version_id: currentMessage.next_version_id,
              model_id: currentMessage.model_id,
            },
          },
        },
        tx,
      )

      // update links on previous and next versions
      if (currentMessage.previous_version_id) {
        await service.message.storage.update(
          {
            user,
            keyEncryptionKey,
            data: {
              where: { id: currentMessage.previous_version_id, user_id: userId },
              data: {
                next_version_id: oldMessage.id,
              },
            },
          },
          tx,
        )
      }
      if (currentMessage.next_version_id) {
        await service.message.storage.update(
          {
            user,
            keyEncryptionKey,
            data: {
              where: { id: currentMessage.next_version_id, user_id: userId },
              data: {
                previous_version_id: oldMessage.id,
              },
            },
          },
          tx,
        )
      }

      await adapter.messageSetRepository.update(
        {
          where: { id: set.id },
          data: {
            length: { increment: 1 },
            last_id: currentMessage.id,
            choiced: currentMessage.id,
          },
        },
        tx,
      )

      // update links on last message in linked list
      await service.message.storage.update(
        {
          user,
          keyEncryptionKey,
          data: {
            where: {
              id: currentMessage.id === lastMessage.id ? oldMessage.id : lastMessage.id,
              user_id: userId,
            },
            data: {
              next_version_id: currentMessage.id,
            },
          },
        },
        tx,
      )

      currentMessage = await service.message.storage.update(
        {
          user,
          keyEncryptionKey,
          data: {
            where: {
              id: currentMessage.id,
              user_id: userId,
            },
            data: {
              content: content,
              full_content: content,
              version: set.length,
              set_id: set.id,
              previous_version_id:
                currentMessage.id === lastMessage.id ? oldMessage.id : lastMessage.id,
              next_version_id: null,
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
              transaction: true,
              set: true,
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
              job: true,
            },
          },
        },
        tx,
      )

      if (!currentMessage) {
        throw new NotFoundError()
      }

      return currentMessage
    })
  }
}
