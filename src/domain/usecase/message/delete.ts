import { UseCaseParams } from '@/domain/usecase/types'
import { IMessage } from '@/domain/entity/message'

export type Delete = (data: { userId: string; id: string }) => Promise<IMessage | null>

export const buildDelete = ({ adapter }: UseCaseParams): Delete => {
  return async ({ userId, id }) => {
    const message = await adapter.messageRepository.delete({
      where: {
        id,
        user_id: userId
      }
    })

    return message
  }
}
