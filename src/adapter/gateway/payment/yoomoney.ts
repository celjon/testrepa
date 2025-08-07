import { AdapterParams } from '@/adapter/types'
import { Amount, Confirmation } from '@/lib/clients/yoomoney'
import { IPayment, IPaymentRequest } from '@/domain/entity/payment'

type Params = Pick<AdapterParams, 'yoomoney'>

export type Yoomoney = {
  createPayment: (data: IPaymentRequest) => Promise<IPayment>
}
export const buildYoomoney = ({ yoomoney }: Params): Yoomoney => {
  const createPayment = async (data: IPaymentRequest) => {
    const amount: Amount = {
      value: data.price.toString(),
      currency: data.currency,
    }

    const confirmation: Confirmation = {
      type: 'redirect',
      return_url: data.returnUrl,
    }

    const result = await yoomoney.client.createPayment({
      amount: amount,
      capture: true,
      description: data.description,
      confirmation: confirmation,
      //save_payment_method: true,
      payment_method_id: data.paymentMethodId,
      receipt: {
        customer: data.customer,
        items: [
          {
            amount: amount,
            description: data.description,
            vat_code: 1,
            quantity: 1,
          },
        ],
      },
    })

    const payment: IPayment = {
      id: result.id,
      url: result.confirmation?.confirmation_url,
    }

    return payment
  }

  return {
    createPayment,
  }
}
