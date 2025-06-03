import { IPresetCategory } from '@/domain/entity/presetCategory'
import { UseCaseParams } from '@/domain/usecase/types'

export type GetCategories = (params: { locale?: string }) => Promise<IPresetCategory[]>

export const buildGetCategories =
  ({ adapter }: UseCaseParams): GetCategories =>
  async ({ locale }) => {
    const categories = await adapter.presetCategoryRepository.list({
      where: {
        locale
      }
    })

    return categories
  }
