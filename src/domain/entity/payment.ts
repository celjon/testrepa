export interface IPaymentRequest {
  price: number
  currency: string
  description: string
  returnUrl: string
  paymentMethodId?: string
  customer: {
    email?: string
    phone?: string
  }
  item?: {
    name: string
  }
}

export interface IPayment {
  id: string
  url?: string
}
