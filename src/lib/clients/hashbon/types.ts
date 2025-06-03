export type GetPaymentLinkParams = {
  shopInvoiceId?: string
  amount: number
  invoiceCurrency?: string
  receiveCurrency?: string
}

export type Receipt = {
  item: string
  descr: string
  num: 1
  price: number
}

export type CreateInvoiceParams = {
  shopInvoiceId?: string
  amount: number
  invoiceCurrency?: string
  receiveCurrency?: string
  receipt?: Receipt[]
}

export type Invoice = {
  id: number
  amount: number
  status: number
  receipt?: Receipt[]
  payFormLink: string
}

export type HashbonClient = {
  getPaymentLink: (data: GetPaymentLinkParams) => string
  createInvoice: (data: CreateInvoiceParams) => Promise<Invoice>
}
