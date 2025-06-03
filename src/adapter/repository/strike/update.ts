import { AdapterParams } from '@/adapter/types'
import { IStrike } from '@/domain/entity/strike'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.StrikeUpdateArgs) => Promise<IStrike | null | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    return (await db.client.strike.update(data)) as IStrike
  }
}
