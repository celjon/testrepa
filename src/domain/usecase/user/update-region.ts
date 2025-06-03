import { IUser } from '@/domain/entity/user'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { Region } from '@prisma/client'

export type UpdateRegion = (data: { userId: string; region: Region }) => Promise<IUser | never>

export const buildUpdateRegion = ({ adapter }: UseCaseParams): UpdateRegion => {
  return async ({ userId, region }) => {
    const user = await adapter.userRepository.update({
      where: { id: userId },
      data: { region }
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }

    return user
  }
}
