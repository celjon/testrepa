import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPresetCategory } from '@/domain/entity/preset-category'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.PresetCategoryDeleteArgs) => Promise<IPresetCategory | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const presetCategory = await db.client.presetCategory.delete(data)

    return presetCategory
  }
}
