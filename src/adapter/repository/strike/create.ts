import { AdapterParams } from '@/adapter/types'
import { IStrike } from '@/domain/entity/strike'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.StrikeCreateArgs) => Promise<IStrike | null | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    return (await db.client.strike.create(data)) as IStrike
  }
}
