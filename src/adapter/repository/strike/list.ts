import { AdapterParams } from '@/adapter/types'
import { IStrike } from '@/domain/entity/strike'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.StrikeFindManyArgs) => Promise<Array<IStrike> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    return (await db.client.strike.findMany(data)) as Array<IStrike>
  }
}
