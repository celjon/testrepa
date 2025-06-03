import { IPaymentRequest } from '@/domain/entity/payment'
import { Adapter, PaymentGateway } from '@/domain/types'

export type Crypto = PaymentGateway['crypto']
export const buildCrypto = ({ paymentGateway }: Adapter): Crypto => {
  const createPayment = async (data: IPaymentRequest) => {
    return await paymentGateway.crypto.createPayment(data)
  }

  return {
    createPayment: createPayment
  }
}
