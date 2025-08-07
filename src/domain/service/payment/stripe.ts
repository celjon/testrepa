import { IPayment, IPaymentRequest } from '@/domain/entity/payment'
import { Adapter } from '../../types'
import { WithRequired } from '@/lib/utils/types'

export type Stripe = (data: WithRequired<IPaymentRequest, 'item'>) => Promise<IPayment>
export const buildStripe = ({ paymentGateway }: Adapter): Stripe => {
  return async (request) => {
    const result = await paymentGateway.stripe(request)

    return {
      id: result.id,
      url: result.url as string,
    }
  }
}
