import { UseCaseParams } from '@/domain/usecase/types'
import { IPresetCategory } from '@/domain/entity/preset-category'
import { InvalidDataError } from '@/domain/errors'

export type CreateCategory = (params: {
  code: string
  locale?: string
  name: string
}) => Promise<IPresetCategory | never>

export const buildCreateCategory =
  ({ adapter }: UseCaseParams): CreateCategory =>
  async ({ code, locale, name }) => {
    let presetCategory = await adapter.presetCategoryRepository.get({
      where: {
        code,
        locale,
      },
    })

    if (presetCategory) {
      throw new InvalidDataError({
        code: 'PRESET_CATEGORY_FOUND',
      })
    }

    presetCategory = await adapter.presetCategoryRepository.create({
      data: {
        code,
        locale,
        name,
      },
    })

    return presetCategory
  }
