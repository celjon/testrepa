import { AdapterParams, UnknownTx } from '@/adapter/types'
import { PlanType, Platform, TransactionType } from '@prisma/client'
import { toCHDateTime } from '@/lib/utils/to-ch-date-time'
import { CHTransaction, mapPrismaToCH } from '@/adapter/repository/transaction/clickhouse-types'
import { ModelFeature } from '@/domain/entity/model'

type Params = Pick<AdapterParams, 'clickhouse'>

export type ChCreateTransaction = (
  args: {
    data: {
      id: string
      amount: number
      type: TransactionType
      user_id: string | null
      platform: Platform | null
      plan_type?: PlanType | null
      from_user_id?: string | null
      referral_id?: string | null
      model_id?: string | null
      provider_id?: string | null
      plan_id?: string | null
      model_features?: ModelFeature[] | null
      developer_key_id?: string | null
      enterprise_id: string | null
      g4f_account_id?: string | null
      messageId?: string | null
      web_search?: number | null
      source?: string | null
      action_id?: string | null
      credit_spent?: number | null
    }
  },
  tx?: UnknownTx,
) => Promise<CHTransaction>

export const buildChCreateTransaction = ({ clickhouse }: Params): ChCreateTransaction => {
  return async ({ data }) => {
    const insertData: CHTransaction = {
      id: data.id,
      amount: data.amount,
      type: mapPrismaToCH[data.type],
      user_id: data.user_id ?? '',
      created_at: toCHDateTime(new Date()),
      platform: data.platform as Platform,
      plan_type: (data.plan_type as PlanType) ?? null,
      model_id: data.model_id ?? null,
      provider_id: data.provider_id ?? null,
      plan_id: data.plan_id ?? null,
      model_features: data.model_features ?? null,
      developer_key_id: data.developer_key_id ?? null,
      enterprise_id: data.enterprise_id ?? '',
      g4f_account_id: data.g4f_account_id ?? null,
      from_user_id: data.from_user_id ?? null,
      referral_id: data.referral_id ?? null,
      web_search: data.web_search ?? null,
      source: data.source ?? null,
      action_id: data.action_id ?? null,
      credit_spent: data.credit_spent ?? null,
    }

    await clickhouse.client.insert({
      table: 'transactions',
      format: 'JSONEachRow',
      values: [insertData],
    })

    return insertData
  }
}
