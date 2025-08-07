import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { IExchangeRate } from '@/domain/entity/exchange-rate'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.ExchangeRateFindManyArgs) => Promise<IExchangeRate[] | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    return await db.client.exchangeRate.findMany(data)
  }
}
