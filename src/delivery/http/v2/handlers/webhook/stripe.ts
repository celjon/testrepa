import { Response } from 'express'
import { TransactionProvider, TransactionStatus } from '@prisma/client'
import { DeliveryParams } from '@/delivery/types'
import { config } from '@/config'
import stripe from 'stripe'
import { StripeRawRequest } from '@/delivery/http/v2/handlers/types'

type Params = Pick<DeliveryParams, 'webhook'>

export type Stripe = (req: StripeRawRequest, res: Response) => Promise<Response>
export const buildStripe = ({ webhook }: Params): Stripe => {
  return async (req, res) => {
    const sig = req.headers['stripe-signature'] as string

    const event = stripe.webhooks.constructEvent(req.rawBody, sig, config.stripe.webhook_secret)

    if (event.type === 'checkout.session.completed') {
      await webhook.payment({
        paymentId: event.data.object.id,
        provider: TransactionProvider.STRIPE,
        status: TransactionStatus.SUCCEDED,
        meta: req.body,
        locale: 'en'
      })
    } else if (event.type === 'checkout.session.expired') {
      await webhook.payment({
        paymentId: event.data.object.id,
        provider: TransactionProvider.STRIPE,
        status: TransactionStatus.FAILED,
        meta: req.body,
        locale: 'en'
      })
    }
    return res.status(200).json()
  }
}
