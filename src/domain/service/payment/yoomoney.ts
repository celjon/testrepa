import { IPaymentRequest } from '@/domain/entity/payment'
import { Adapter, PaymentGateway } from '@/domain/types'

export type Yoomoney = PaymentGateway['yoomoney']
export const buildYoomoney = ({ paymentGateway }: Adapter): Yoomoney => {
  const createPayment = async (data: IPaymentRequest) => {
    return await paymentGateway.yoomoney.createPayment(data)
  }

  return {
    createPayment,
  }
}
