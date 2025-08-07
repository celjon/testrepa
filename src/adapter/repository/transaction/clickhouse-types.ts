import { Platform, TransactionType } from '@prisma/client'
import { ModelFeature } from '@/domain/entity/model'

export enum CHTransactionType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  WRITE_OFF = 'WRITE_OFF',
  REPLENISH = 'REPLENISH',
  WITHDRAW = 'WITHDRAW',
  REFERRAL_REWARD = 'REFERRAL_REWARD',
}

export type CHTransaction = {
  id: string
  amount: number
  type: CHTransactionType
  user_id: string
  created_at: string
  platform: Platform | null
  plan_type?: string | null
  model_id?: string | null
  provider_id?: string | null
  plan_id?: string | null
  model_features?: ModelFeature[] | null
  developer_key_id?: string | null
  enterprise_id: string
  g4f_account_id?: string | null
  from_user_id?: string | null
  referral_id?: string | null
  web_search?: number | null
  source?: string | null
  action_id?: string | null
  credit_spent?: number | null
}

export const mapPrismaToCH: Record<TransactionType, CHTransactionType> = {
  SUBSCRIPTION: CHTransactionType.SUBSCRIPTION,
  WRITE_OFF: CHTransactionType.WRITE_OFF,
  REPLINSH: CHTransactionType.REPLENISH,
  WITHDRAW: CHTransactionType.WITHDRAW,
  REFERRAL_REWARD: CHTransactionType.REFERRAL_REWARD,
}
