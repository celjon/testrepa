import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPresetCategory } from '@/domain/entity/preset-category'

type Params = Pick<AdapterParams, 'db'>

export type Get = (
  data: Prisma.PresetCategoryFindFirstArgs,
) => Promise<IPresetCategory | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const presetCategory = await db.client.presetCategory.findFirst(data)

    return presetCategory
  }
}
