import { AdapterParams } from '@/adapter/types'
import { CreatePaymentParams, CreatePaymentPayloadSuccess } from '@/lib/clients/tinkoff'

type Params = Pick<AdapterParams, 'tinkoff'>

export type Tinkoff = (data: CreatePaymentParams) => Promise<CreatePaymentPayloadSuccess | never>

export const buildTinkoff = ({ tinkoff }: Params): Tinkoff => {
  return (data) => {
    return tinkoff.client.payment.create(data)
  }
}
