import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPresetCategory } from '@/domain/entity/presetCategory'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.PresetCategoryUpdateArgs) => Promise<IPresetCategory | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const presetCategory = await db.client.presetCategory.update(data)

    return presetCategory
  }
}
