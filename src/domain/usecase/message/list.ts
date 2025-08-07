import { UseCaseParams } from '@/domain/usecase/types'
import { IMessage } from '@/domain/entity/message'
import { NotFoundError } from '@/domain/errors'

export type List = (data: {
  userId: string
  keyEncryptionKey: string | null
  chatId: string
  page?: number
  quantity?: number
}) => Promise<{
  data: Array<IMessage>
}>

export const buildList = ({ adapter, service }: UseCaseParams): List => {
  return async ({ userId, keyEncryptionKey, chatId, page, quantity }) => {
    const chat = await adapter.chatRepository.get({
      where: {
        user_id: userId,
        id: chatId,
        deleted: false,
      },
    })

    if (!chat) {
      throw new NotFoundError({
        code: 'CHAT_NOT_FOUND',
      })
    }

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

    const messages = await service.message.paginate({
      user,
      keyEncryptionKey,
      query: {
        where: {
          chat_id: chatId,
          choiced: true,
        },
        orderBy: {
          created_at: 'desc',
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
      page: page || 1,
      quantity: quantity || 20,
    })

    return messages
  }
}
