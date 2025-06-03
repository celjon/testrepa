import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPreset } from '@/domain/entity/preset'

type Params = Pick<AdapterParams, 'db'>

export type Upsert = (data?: Prisma.PresetUpsertArgs) => Promise<IPreset | null | never>

export const buildUpsert = ({ db }: Params): Upsert => {
  return async (data) => {
    return (await db.client.preset.upsert(data as any)) as IPreset
  }
}
