import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (data: Prisma.PresetCountArgs) => Promise<number | never>

export const buildCount = ({ db }: Params): Count => {
  return async (data) => {
    return db.client.preset.count(data)
  }
}
