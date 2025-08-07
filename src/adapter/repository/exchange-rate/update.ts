import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { IExchangeRate } from '@/domain/entity/exchange-rate'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.ExchangeRateUpdateArgs) => Promise<IExchangeRate | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    return await db.client.exchangeRate.update(data)
  }
}
