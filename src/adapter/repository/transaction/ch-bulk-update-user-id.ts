import { AdapterParams } from '@/adapter/types'
import { CHTransaction } from '@/adapter/repository/transaction/clickhouse-types'

type Params = Pick<AdapterParams, 'clickhouse'>

export type ChBulkUpdateUserId = (params: {
  oldUserIds: string[]
  newUserId: string
}) => Promise<void>

export const buildChBulkUpdateUserId = ({ clickhouse }: Params): ChBulkUpdateUserId => {
  return async ({ oldUserIds, newUserId }) => {
    if (oldUserIds.length === 0) return

    const conditions = oldUserIds.map((_, idx) => `user_id = {oldUserId${idx}:String}`).join(' OR ')
    const query = `
      SELECT *
      FROM transactions
      WHERE ${conditions}
    `

    const query_params = Object.fromEntries(oldUserIds.map((id, idx) => [`oldUserId${idx}`, id]))

    const result = await clickhouse.client.query({
      query,
      format: 'JSONEachRow',
      query_params,
    })

    const raw = (await result.json()) as CHTransaction[]

    if (raw.length === 0) return

    const updated = raw.map((tx) => ({
      ...tx,
      user_id: newUserId,
    }))

    await clickhouse.client.insert({
      table: 'transactions',
      format: 'JSONEachRow',
      values: updated,
    })

    const deleteConditions = conditions
    await clickhouse.client.command({
      query: `
        ALTER TABLE transactions
        DELETE
        WHERE ${deleteConditions}
      `,
      query_params,
    })
  }
}
