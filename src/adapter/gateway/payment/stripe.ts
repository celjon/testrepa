import { AdapterParams } from '@/adapter/types'
import { config } from '@/config'
import { IPaymentRequest } from '@/domain/entity/payment'
import stp from 'stripe'

type Params = Pick<AdapterParams, 'stripe'>

export type Stripe = (data: IPaymentRequest) => Promise<stp.Checkout.Session | never>

export const buildStripe = ({ stripe }: Params): Stripe => {
  return async (data) => {
    const session = await stripe.client.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: config.frontend.address,
      line_items: [
        {
          price_data: {
            currency: data.currency,
            unit_amount: data.price * 100,
            product_data: {
              name: data.item?.name as string,
            },
          },
          quantity: 1,
        },
      ],
    })

    return session
  }
}
