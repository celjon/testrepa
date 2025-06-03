import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type UpdateMany = (data: Prisma.PaymentMethodUpdateManyArgs) => Promise<Prisma.BatchPayload | never>
export const buildUpdateMany = ({ db }: Params): UpdateMany => {
  return async (data) => {
    return db.client.paymentMethod.updateMany(data)
  }
}
