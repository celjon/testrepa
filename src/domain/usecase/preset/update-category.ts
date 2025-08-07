import { UseCaseParams } from '@/domain/usecase/types'
import { IPresetCategory } from '@/domain/entity/preset-category'
import { InvalidDataError } from '@/domain/errors'

export type UpdateCategory = (params: {
  id: string
  code?: string
  locale?: string
  name?: string
}) => Promise<IPresetCategory | never>

export const buildUpdateCategory =
  ({ adapter }: UseCaseParams): UpdateCategory =>
  async ({ id, code, locale, name }) => {
    let presetCategory: IPresetCategory | null

    if (code) {
      presetCategory = await adapter.presetCategoryRepository.get({
        where: {
          code,
          locale,
        },
      })

      if (presetCategory && presetCategory.code !== code) {
        throw new InvalidDataError({
          code: 'PRESET_CATEGORY_FOUND',
        })
      }
    }

    presetCategory = await adapter.presetCategoryRepository.update({
      where: {
        id,
      },
      data: {
        code,
        locale,
        name,
      },
    })

    return presetCategory
  }
