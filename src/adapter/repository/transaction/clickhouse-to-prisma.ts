import { Currency, TransactionProvider, TransactionType } from '@prisma/client'
import { ITransaction } from '@/domain/entity/transaction'
import { CHTransaction, CHTransactionType } from '@/adapter/repository/transaction/clickhouse-types'

export type ClickHouseToPrisma = (data: CHTransaction[]) => Promise<ITransaction[]>

export const buildClickHouseToPrisma = (): ClickHouseToPrisma => {
  return async (data: CHTransaction[]) => {
    return data.map(
      (item) =>
        ({
          id: item.id,
          provider: TransactionProvider.BOTHUB,
          amount: Number(item.amount),
          currency: Currency.BOTHUB_TOKEN,
          meta: item.web_search
            ? {
                expense_details: { web_search: item.web_search ?? 0 },
              }
            : item.source === 'auto_credit_replenish'
              ? { source: 'auto_credit_replenish' }
              : null,
          status: 'SUCCEDED',
          type: item.type === CHTransactionType.REPLENISH ? TransactionType.REPLINSH : item.type,
          plan_id: item.plan_id,
          user_id: item.user_id || null,
          from_user_id: item.from_user_id,
          referral_id: item.referral_id,
          created_at: new Date(item.created_at),
          external_id: null,
          enterprise_id: item.enterprise_id || null,
          deleted: false,
          developer_key_id: item.developer_key_id,
          actions: [
            {
              id: item.id,
              type: item.type === TransactionType.WRITE_OFF ? 'token:writeoff' : item.type,
              platform: item.platform,
              model_id: item.model_id,
              provider_id: item.provider_id,
              user_id: item.user_id ?? null,
              enterprise_id: item.enterprise_id ?? null,
              transaction_id: item.id,
              created_at: new Date(item.created_at),
              meta: null,
            },
          ],
          action: {
            id: item.id,
            model_id: item.model_id ?? null,
            platform: item.platform,
          },
        }) as ITransaction,
    )
  }
}
