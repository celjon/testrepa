import { UseCaseParams } from '@/domain/usecase/types'
import { IChat } from '@/domain/entity/chat'

export type DeleteMany = (data: { userId: string; ids: Array<string> }) => Promise<IChat[] | never>

export const buildDeleteMany = ({ adapter }: UseCaseParams): DeleteMany => {
  return async ({ userId, ids }) => {
    const chats = await adapter.chatRepository.list({
      where: {
        id: {
          in: ids,
        },
        user_id: userId,
      },
    })

    await adapter.chatRepository.deleteMany({
      where: {
        id: {
          in: ids,
        },
        user_id: userId,
      },
    })

    return chats
  }
}
