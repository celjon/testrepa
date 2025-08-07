export type PaymentItem = {
  name: string
  /**
   * Цена в копейках
   *
   * @type {number}
   */
  price: number
  quantity: number
  /**
   * Цена в копейках
   *
   * @type {number}
   */
  amount: number

  tax: 'none' | 'vat0' | 'vat10' | 'vat20' | 'vat110' | 'vat120'

  paymentMethod?:
    | 'full_prepayment'
    | 'prepayment'
    | 'advance'
    | 'full_payment'
    | 'partial_payment'
    | 'credit'
    | 'credit_payment'
}

export type CreatePaymentParams = {
  amount: number
  orderId: string
  description?: string
  data: {
    email?: string
  }
  receipt: {
    email?: string
    items: Array<PaymentItem>
    /**
     *
     * Система налогообложения. Перечисление с возможными значениями:
     "osn" - общая СН;
     "usn_income" - упрощенная СН (доходы);
     "usn_income_outcome" - упрощенная СН (доходы минус расходы);
     "envd" - единый налог на вмененный доход;
     "esn" - единый сельскохозяйственный налог;
     "patent" - патентная СН.
     */
    taxation: 'osn' | 'usn_income' | 'usn_income_outcome' | 'envd' | 'esn' | 'patent'
  }
}

export type CreatePaymentPayloadSuccess = {
  success: boolean
  errorCode: 0
  terminalKey: string
  status: string
  paymentId: number
  orderId: number
  amount: number
  paymentUrl: string
}
