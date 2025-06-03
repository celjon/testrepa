import { UseCaseParams } from '@/domain/usecase/types'
import { IPreset } from '@/domain/entity/preset'

export type Favorite = (data: { id: string; userId: string }) => Promise<IPreset | never>

export const buildFavorite =
  ({ adapter }: UseCaseParams): Favorite =>
  async ({ id, userId }) => {
    const preset = await adapter.presetRepository.update({
      where: {
        id
      },
      data: {
        users: {
          connect: {
            id: userId
          }
        }
      }
    })

    preset.favorite = true

    return preset
  }
