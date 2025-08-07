import { UseCaseParams } from '@/domain/usecase/types'
import { IChat } from '@/domain/entity/chat'
import { NotFoundError } from '@/domain/errors'

export type Delete = (data: { chatId: string; userId: string }) => Promise<IChat | never | null>

export const buildDelete = ({ adapter, service }: UseCaseParams): Delete => {
  return async ({ chatId, userId }) => {
    const chat = await adapter.chatRepository.delete({
      where: {
        id: chatId,
        user_id: userId,
      },
    })

    if (!chat) {
      throw new NotFoundError({
        code: 'CHAT_NOT_FOUND',
      })
    }

    service.chat.eventStream.emit({
      chat,
      event: {
        name: 'DELETE',
      },
    })

    return chat
  }
}
