import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPresetCategory } from '@/domain/entity/presetCategory'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.PresetCategoryCreateArgs) => Promise<IPresetCategory | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const presetCategory = await db.client.presetCategory.create(data)

    return presetCategory
  }
}
