import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'

export type Stop = (params: { userId: string; chatId: string }) => Promise<void>

export const buildStop =
  ({ adapter, service }: UseCaseParams): Stop =>
  async ({ chatId, userId }) => {
    const chat = await adapter.chatRepository.get({
      where: {
        id: chatId,
        user_id: userId,
        deleted: false,
      },
    })

    if (!chat) {
      throw new NotFoundError({
        code: 'CHAT_NOT_FOUND',
      })
    }

    await service.job.stopAll({
      chat,
    })
  }
