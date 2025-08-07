import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPresetCategory } from '@/domain/entity/preset-category'

type Params = Pick<AdapterParams, 'db'>

export type List = (
  data?: Prisma.PresetCategoryFindManyArgs,
) => Promise<Array<IPresetCategory> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    const presetCategories = await db.client.presetCategory.findMany(data)

    return presetCategories
  }
}
