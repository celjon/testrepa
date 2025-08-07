import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { IExchangeRate } from '@/domain/entity/exchange-rate'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.ExchangeRateCreateArgs) => Promise<IExchangeRate | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    return await db.client.exchangeRate.create(data)
  }
}
