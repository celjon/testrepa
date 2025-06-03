import { AdapterParams } from '@/adapter/types'
import { buildTinkoff, Tinkoff } from './tinkoff'
import { buildYoomoney, Yoomoney } from './yoomoney'
import { buildCrypto, Crypto } from './crypto'
import { buildStripe, Stripe } from './stripe'

type Params = Pick<AdapterParams, 'yoomoney' | 'hashbon' | 'tinkoff' | 'stripe'>

export type PaymentGateway = {
  yoomoney: Yoomoney
  crypto: Crypto
  tinkoff: Tinkoff
  stripe: Stripe
}
export const buildPaymentGateway = (params: Params): PaymentGateway => {
  const yoomoney = buildYoomoney(params)
  const crypto = buildCrypto(params)
  const tinkoff = buildTinkoff(params)
  return {
    yoomoney,
    crypto,
    tinkoff,
    stripe: buildStripe(params)
  }
}
