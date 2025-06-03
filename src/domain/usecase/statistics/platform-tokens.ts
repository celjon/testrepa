import { Platform, Role } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'

export type PlatformTokens = (p: { userId: string; dateFrom: string; dateTo: string }) => Promise<
  {
    sum: number
    platform: Platform
    requests: bigint
  }[]
>

export const buildPlatformTokens = ({ adapter }: UseCaseParams): PlatformTokens => {
  return async ({ userId, dateFrom, dateTo }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenError()
    }

    return adapter.actionRepository.getPlatformTokens({
      dateTo,
      dateFrom
    })
  }
}
