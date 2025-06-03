import { UseCaseParams } from '@/domain/usecase/types'

export type DeleteMany = (data: { userId: string; ids: string[] }) => Promise<{ count: number } | null>

export const buildDeleteMany = ({ adapter }: UseCaseParams): DeleteMany => {
  return async ({ userId, ids }) => {
    const message = await adapter.messageRepository.deleteMany({
      where: {
        id: {
          in: ids
        },
        user_id: userId
      }
    })

    return message
  }
}
