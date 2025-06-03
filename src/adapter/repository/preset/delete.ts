import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPreset } from '@/domain/entity/preset'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.PresetDeleteArgs) => Promise<IPreset | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    const preset = await db.client.preset.delete(data)

    return preset
  }
}
