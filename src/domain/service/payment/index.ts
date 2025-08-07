import { Adapter } from '../../types'
import { buildCrypto, Crypto } from './crypto'
import { buildStripe, Stripe } from './stripe'
import { buildTinkoff, Tinkoff } from './tinkoff'
import { buildYoomoney, Yoomoney } from './yoomoney'

export type PaymentService = {
  yoomoney: Yoomoney
  crypto: Crypto
  tinkoff: Tinkoff
  stripe: Stripe
}
export const buildPaymentService = (params: Adapter): PaymentService => {
  const yoomoney = buildYoomoney(params)
  const crypto = buildCrypto(params)
  const tinkoff = buildTinkoff(params)
  const stripe = buildStripe(params)

  return {
    yoomoney,
    crypto,
    tinkoff,
    stripe,
  }
}
