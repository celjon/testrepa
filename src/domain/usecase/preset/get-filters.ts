import { PresetAccess } from '@prisma/client'
import { config } from '@/config'
import { IPresetFilter } from '@/domain/entity/preset-filter'
import { UseCaseParams } from '@/domain/usecase/types'

export type GetFilters = (params: { locale?: string }) => Promise<{
  categories: IPresetFilter[]
  models: IPresetFilter[]
}>

export const buildGetFilters =
  ({ adapter }: UseCaseParams): GetFilters =>
  async ({ locale = config.frontend.default_locale }) => {
    const [categories, categoriesCount, models, modelsCount] = await Promise.all([
      adapter.presetCategoryRepository.list({
        orderBy: {
          presets: {
            _count: 'desc',
          },
        },
      }),
      (await adapter.presetCategoryRepository.list({
        select: {
          _count: {
            select: {
              presets: {
                where: {
                  access: PresetAccess.PUBLIC,
                },
              },
            },
          },
        },
        orderBy: {
          presets: {
            _count: 'desc',
          },
        },
      })) as unknown as {
        _count: {
          presets: number
        }
      }[],
      adapter.modelRepository.list({
        orderBy: {
          presets: {
            _count: 'desc',
          },
        },
      }),
      (await adapter.modelRepository.list({
        select: {
          _count: {
            select: {
              presets: {
                where: {
                  access: PresetAccess.PUBLIC,
                },
              },
            },
          },
        },
        orderBy: {
          presets: {
            _count: 'desc',
          },
        },
      })) as unknown as {
        _count: {
          presets: number
        }
      }[],
    ])

    const categoriesFiltersAll: IPresetFilter[] = categories.map((category, index) => ({
      id: category.id,
      name: 'category',
      value: category.code,
      item_count: categoriesCount[index]._count.presets,
      category_id: category.id,
      category,
    }))
    const categoriesFiltersMap = new Map<string, IPresetFilter>()

    for (const categoryFilter of categoriesFiltersAll) {
      if (!categoryFilter.category) {
        break
      }

      const uniqueCategoryFilter: IPresetFilter | null =
        categoriesFiltersMap.get(categoryFilter.category.code) ?? null

      if (uniqueCategoryFilter) {
        uniqueCategoryFilter.item_count += categoryFilter.item_count

        if (uniqueCategoryFilter.category && categoryFilter.category.locale === locale) {
          uniqueCategoryFilter.category.name = categoryFilter.category.name
          uniqueCategoryFilter.category.locale = locale
        }
      } else {
        categoriesFiltersMap.set(categoryFilter.category.code, {
          ...categoryFilter,
          category: {
            ...categoryFilter.category,
            ...(categoryFilter.category.locale === locale && {
              name: categoryFilter.category.name,
            }),
            ...(categoryFilter.category.locale !== locale && {
              name: `${categoryFilter.category.name} (Unknown locale)`,
            }),
          },
        })
      }
    }

    const categoriesFilters: IPresetFilter[] = [...categoriesFiltersMap.values()].filter(
      (categoryFilter) => categoryFilter.item_count > 0,
    )

    const modelsFilters: IPresetFilter[] = models
      .map((model, index) => ({
        id: model.id,
        name: 'model',
        value: model.id,
        item_count: modelsCount[index]._count.presets,
        model_id: model.id,
        model,
      }))
      .filter((modelFilter) => modelFilter.item_count > 0)

    return {
      categories: categoriesFilters,
      models: modelsFilters,
    }
  }
