import { IPayment, IPaymentRequest } from '@/domain/entity/payment'
import { Adapter } from '../../types'
import { randomUUID } from 'crypto'
import { WithRequired } from '@/lib/utils/types'

export type Tinkoff = (data: WithRequired<IPaymentRequest, 'item'>) => Promise<IPayment>
export const buildTinkoff = ({ paymentGateway }: Adapter): Tinkoff => {
  return async (request) => {
    const orderId = randomUUID()
    const result = await paymentGateway.tinkoff({
      amount: request.price * 100,
      description: request.description,
      orderId,
      data: {
        email: request.customer.email?.toLowerCase()
      },
      receipt: {
        email: request.customer.email?.toLowerCase(),
        taxation: 'usn_income',
        items: [
          {
            price: request.price * 100,
            amount: request.price * 100,
            quantity: 1,
            name: request.item.name,
            tax: 'none'
          }
        ]
      }
    })

    const payment: IPayment = {
      id: result.paymentId.toString(),
      url: result.paymentUrl
    }

    return payment
  }
}
