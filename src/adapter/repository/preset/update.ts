import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPreset } from '@/domain/entity/preset'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.PresetUpdateArgs) => Promise<IPreset | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const preset = await db.client.preset.update(data)

    return preset
  }
}
