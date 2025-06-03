import { UseCaseParams } from '@/domain/usecase/types'
import { IPreset } from '@/domain/entity/preset'
import { NotFoundError } from '@/domain/errors'
import { Role } from '@prisma/client'

export type Delete = (data: { id: string; userId: string }) => Promise<IPreset | never>

export const buildDelete =
  ({ adapter }: UseCaseParams): Delete =>
  async ({ id, userId }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }

    const isAdmin = user.role === Role.ADMIN

    const preset = await adapter.presetRepository.delete({
      where: {
        id,
        ...(!isAdmin && {
          author_id: userId
        })
      }
    })

    if (!preset) {
      throw new NotFoundError({
        code: 'PRESET_NOT_FOUND'
      })
    }

    return preset
  }
