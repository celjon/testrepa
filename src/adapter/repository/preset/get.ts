import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPreset } from '@/domain/entity/preset'

type Params = Pick<AdapterParams, 'db'>

export type GetPreset = (data: Prisma.PresetFindFirstArgs) => Promise<IPreset | null | never>

export const buildGetPreset = ({ db }: Params): GetPreset => {
  return async (data) => {
    const preset = await db.client.preset.findFirst(data)

    return preset
  }
}
