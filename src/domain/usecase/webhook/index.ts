import { UseCaseParams } from '@/domain/usecase/types'
import { buildPayment, Payment } from './payment'

export type WebhookUseCase = {
  payment: Payment
}

export const buildWebhookUseCase = (params: UseCaseParams): WebhookUseCase => {
  const payment = buildPayment(params)
  return {
    payment,
  }
}
