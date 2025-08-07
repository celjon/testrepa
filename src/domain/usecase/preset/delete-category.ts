import { UseCaseParams } from '@/domain/usecase/types'
import { NotFoundError } from '@/domain/errors'
import { IPresetCategory } from '@/domain/entity/preset-category'

export type DeleteCategory = (data: { id: string }) => Promise<IPresetCategory | never>

export const buildDeleteCategory =
  ({ adapter }: UseCaseParams): DeleteCategory =>
  async ({ id }) => {
    const presetCategory = await adapter.presetCategoryRepository.delete({
      where: {
        id,
      },
    })

    if (!presetCategory) {
      throw new NotFoundError({
        code: 'PRESET_CATEGORY_NOT_FOUND',
      })
    }

    return presetCategory
  }
