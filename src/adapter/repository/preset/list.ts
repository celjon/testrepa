import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPreset } from '@/domain/entity/preset'

type Params = Pick<AdapterParams, 'db'>

export type ListPresets = (data?: Prisma.PresetFindManyArgs) => Promise<Array<IPreset> | never>

export const buildListPresets = ({ db }: Params): ListPresets => {
  return async (data) => {
    const presets = await db.client.preset.findMany(data)

    return presets
  }
}
