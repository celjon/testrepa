import { IPaymentMethod } from '@/domain/entity/payment-method'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.PaymentMethodCreateArgs) => Promise<IPaymentMethod | never>
export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    return (await db.client.paymentMethod.create(data)) as IPaymentMethod
  }
}
