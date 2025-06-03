import { AdapterParams } from '@/adapter/types'
import { Invoice } from '@/lib/clients/hashbon'
import { IPayment, IPaymentRequest } from '@/domain/entity/payment'

type Params = Pick<AdapterParams, 'hashbon'>

export type Crypto = {
  createPayment: (data: IPaymentRequest) => Promise<IPayment>
}
export const buildCrypto = ({ hashbon }: Params): Crypto => {
  const createPayment = async (data: IPaymentRequest) => {
    const invoice: Invoice = await hashbon.client.createInvoice({
      amount: data.price,
      invoiceCurrency: data.currency,
      receiveCurrency: 'USDT.TRC20',
      receipt: [
        {
          item: data.description,
          num: 1,
          price: data.price,
          descr: data.description
        }
      ]
    })
    return {
      id: invoice.id.toString(),
      url: invoice.payFormLink
    } as IPayment
  }

  return {
    createPayment
  }
}
