import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPresetCategory } from '@/domain/entity/presetCategory'

type Params = Pick<AdapterParams, 'db'>

export type Upsert = (data?: Prisma.PresetCategoryUpsertArgs) => Promise<IPresetCategory | null | never>

export const buildUpsert = ({ db }: Params): Upsert => {
  return async (data) => {
    return (await db.client.presetCategory.upsert(data as any)) as IPresetCategory
  }
}
