import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IPaymentMethod } from '@/domain/entity/payment-method'

type Params = Pick<AdapterParams, 'db'>

export type Get = (
  data: Prisma.PaymentMethodFindFirstArgs,
) => Promise<IPaymentMethod | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    return (await db.client.paymentMethod.findFirst(data)) as IPaymentMethod
  }
}
