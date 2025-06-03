import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPreset } from '@/domain/entity/preset'

type Params = Pick<AdapterParams, 'db'>

export type CreatePreset = (data: Prisma.PresetCreateArgs) => Promise<IPreset | never>
export const buildCreatePreset = ({ db }: Params): CreatePreset => {
  return async (data) => {
    const preset = await db.client.preset.create(data)

    return preset
  }
}
