import { UseCaseParams } from '@/domain/usecase/types'
import { IPreset } from '@/domain/entity/preset'

export type Unfavorite = (data: { id: string; userId: string }) => Promise<IPreset | never>

export const buildUnfavorite =
  ({ adapter }: UseCaseParams): Unfavorite =>
  async ({ id, userId }) => {
    const preset = await adapter.presetRepository.update({
      where: {
        id,
      },
      data: {
        users: {
          disconnect: {
            id: userId,
          },
        },
      },
    })

    preset.favorite = false

    return preset
  }
