import { PresetAccess, Prisma } from '@prisma/client'
import { config } from '@/config'
import { IPreset } from '@/domain/entity/preset'
import { IPresetCategory } from '@/domain/entity/preset-category'
import { UseCaseParams } from '@/domain/usecase/types'

export type List = (params: {
  userId: string
  search?: string
  categories?: string[]
  models?: string[]
  favorite?: boolean
  private?: boolean
  page?: number
  quantity?: number
  locale?: string
}) => Promise<{
  data: IPreset[]
  total: number
  start: number
  end: number
  page: number
  pages: number
}>

export const buildList =
  ({ adapter }: UseCaseParams): List =>
  async ({
    userId,
    search,
    categories,
    models,
    favorite = false,
    private: privateList = false,
    page,
    quantity = 20,
    locale = config.frontend.default_locale,
  }) => {
    const where: Prisma.PresetWhereInput = {
      AND: [
        ...(search
          ? [
              {
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  } satisfies Prisma.PresetWhereInput,
                  {
                    description: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  } satisfies Prisma.PresetWhereInput,
                ],
              },
            ]
          : []),
        {
          OR: [
            ...(favorite
              ? [
                  {
                    users: {
                      some: {
                        id: userId,
                      },
                    },
                  },
                ]
              : []),
            ...(privateList
              ? [
                  {
                    access: PresetAccess.PRIVATE,
                    author_id: userId,
                  },
                ]
              : []),
          ],
        },
      ],
      ...(categories && {
        categories: {
          some: {
            code: {
              in: categories,
            },
          },
        },
      }),
      ...(models && {
        OR: [
          {
            model_id: {
              in: models.filter((model) => model !== 'other'),
            },
          },
          ...(models.some((model) => model === 'other')
            ? [
                {
                  model_id: null,
                },
              ]
            : []),
        ],
      }),
      ...(!favorite &&
        !privateList && {
          access: PresetAccess.PUBLIC,
        }),
    }

    const orderBy: Prisma.PresetOrderByWithRelationInput[] = [
      {
        usage_count: 'desc',
      },
      {
        created_at: 'desc',
      },
    ]

    const include: Prisma.PresetInclude = {
      author: {
        select: {
          email: true,
        },
      },
      // author: true,
      attachments: {
        include: {
          file: true,
        },
      },
      categories: true,
    }

    const total = await adapter.presetRepository.count({
      where,
    })
    const pages = total > 0 ? Math.ceil(total / quantity) : 1

    if (!page) {
      const data = await adapter.presetRepository.list({
        where,
        orderBy,
        include,
      })

      const start = 0
      const end = total
      const page = 1

      return {
        data,
        total,
        start,
        end,
        page,
        pages,
      }
    }

    const skip = page !== 1 ? quantity * (page - 1) : 0
    const take = quantity

    let favoritePresets: IPreset[]
    if (favorite) {
      favoritePresets = []
    } else {
      favoritePresets = await adapter.presetRepository.list({
        where: {
          users: {
            some: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
        },
      })
    }

    const presets = await adapter.presetRepository.list({
      where,
      orderBy,
      skip,
      take,
      include,
    })

    const presetsCategories = await Promise.all(
      presets.map((preset) => {
        if (!preset.categories) {
          return [] as IPresetCategory[]
        }

        return Promise.all(
          preset.categories.map((category) => {
            if (category.locale === locale) {
              return Promise.resolve(category)
            }

            return adapter.presetCategoryRepository.get({
              where: {
                code: category.code,
                locale,
              },
            })
          }),
        )
      }),
    )

    const data: IPreset[] = presets.map((preset, index) => ({
      ...preset,
      ...(favorite && {
        favorite: true,
      }),
      ...(!favorite && {
        favorite: favoritePresets.some((favoritePreset) => favoritePreset.id === preset.id),
      }),
      categories: presetsCategories[index].map(
        (category, categoryIndex) => category ?? preset.categories?.[categoryIndex],
      ) as IPresetCategory[],
    }))

    const start = total === 0 ? total : skip + 1
    const end = total <= quantity ? total : skip + take

    return {
      data,
      total,
      start,
      end,
      page,
      pages,
    }
  }
