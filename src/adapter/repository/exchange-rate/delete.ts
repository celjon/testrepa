import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { IExchangeRate } from '@/domain/entity/exchange-rate'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.ExchangeRateDeleteArgs) => Promise<IExchangeRate | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    return await db.client.exchangeRate.delete(data)
  }
}
