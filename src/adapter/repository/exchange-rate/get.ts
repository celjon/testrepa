import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { IExchangeRate } from '@/domain/entity/exchange-rate'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.ExchangeRateFindFirstArgs) => Promise<IExchangeRate | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    return await db.client.exchangeRate.findFirst(data)
  }
}
