import { UseCaseParams } from '@/domain/usecase/types'
import { IMessage } from '@/domain/entity/message'
import { NotFoundError } from '@/domain/errors'

export type ListAll = (data: {
  userId: string
  keyEncryptionKey: string | null
  chatId: string
}) => Promise<Array<IMessage>>

export const buildListAll = ({ adapter, service }: UseCaseParams): ListAll => {
  return async ({ userId, keyEncryptionKey, chatId }) => {
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

    const messages = await service.message.storage.list({
      user,
      keyEncryptionKey,
      data: {
        where: { chat_id: chatId },
        orderBy: { created_at: 'desc' },
        include: {
          images: {
            include: { original: true },
          },
          voice: {
            include: { file: true },
          },
          video: {
            include: { file: true },
          },
        },
      },
    })

    return messages
  }
}
