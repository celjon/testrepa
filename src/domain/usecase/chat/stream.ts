import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { IChatEventStream } from '@/domain/service/chat/event-stream/types'

export type Stream = (params: { chatId: string; userId: string }) => Promise<IChatEventStream>

export const buildStream =
  ({ adapter, service }: UseCaseParams): Stream =>
  async ({ chatId, userId }) => {
    const chat = await adapter.chatRepository.get({
      where: {
        id: chatId,
        user_id: userId,
        deleted: false
      }
    })

    if (!chat) {
      throw new NotFoundError({
        code: 'CHAT_NOT_FOUND'
      })
    }

    const chatEventStream: IChatEventStream = await service.chat.eventStream.stream({ chat })

    return chatEventStream
  }
