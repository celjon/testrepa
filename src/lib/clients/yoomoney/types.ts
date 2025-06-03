export type CreatePaymentParams = {
  amount: Amount
  capture: boolean
  description: string
  confirmation: Confirmation
  save_payment_method?: boolean
  payment_method_id?: string
  receipt?: {
    customer: {
      email?: string
      phone?: string
    }
    items: Array<{
      description: string
      amount: Amount
      vat_code: 1
      quantity: 1
    }>
  }
}

export interface Payment {
  id: string
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled'
  paid: boolean
  amount: Amount
  authorization_details: AuthorizationDetails
  created_at: Date
  description?: string
  expires_at?: Date
  captured_at?: Date
  payment_method?: PaymentMethod
  recipient: Recipient
  refundable: boolean
  test: boolean
  income_amount?: IncomeAmount
  confirmation?: Confirmation
}

export interface Amount {
  value: string
  currency: string
}

export interface Confirmation {
  type: string
  return_url?: string
  confirmation_url?: string
}

export interface AuthorizationDetails {
  rrn: string
  auth_code: string
  three_d_secure: ThreeDSecure
}

export interface ThreeDSecure {
  applied: boolean
}

export interface PaymentMethod {
  type: string
  id: string
  saved: boolean
  card: Card
  title: string
}

export interface Card {
  first6: string
  last4: string
  expiry_month: string
  expiry_year: string
  card_type: string
  issuer_country: string
  issuer_name: string
}

export interface Recipient {
  account_id: string
  gateway_id: string
}

export interface IncomeAmount {
  value: string
  currency: string
}

export type YoomoneyClient = {
  createPayment: (data: CreatePaymentParams) => Promise<Payment>
  getPayment: (paymentId: string) => Promise<Payment>
}

export class CreatePaymentError extends Error {
  public message: string
  public details: string
  public errorCode: string

  constructor({ errorCode, message, details }: { errorCode: string; message: string; details: string }) {
    super(message)

    this.message = message
    this.details = details
    this.errorCode = errorCode
  }
}
