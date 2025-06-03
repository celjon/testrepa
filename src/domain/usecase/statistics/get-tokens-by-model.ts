import { Role } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'

export type GetTokensByModel = (p: { userId: string; dateFrom: string; dateTo: string }) => Promise<
  {
    sum: number
    model_id: string
    requests: bigint
  }[]
>

export const buildGetTokensByModel = ({ adapter }: UseCaseParams): GetTokensByModel => {
  return async ({ userId, dateFrom, dateTo }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    return adapter.actionRepository.getTokensByModel({
      dateTo,
      dateFrom
    })
  }
}
