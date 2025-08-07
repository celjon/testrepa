import { config } from '@/config'
import { AdapterParams } from '@/adapter/types'
import { G4FProductUsage } from '@/domain/entity/statistics'

type Params = Pick<AdapterParams, 'db'>

export type GetG4FProductUsage = (p: {
  dateFrom: string
  dateTo: string
}) => Promise<G4FProductUsage>

export const buildGetG4FProductUsage = ({ db }: Params): GetG4FProductUsage => {
  return async ({ dateTo, dateFrom }) => {
    const normalizedDateFrom = new Date(dateFrom).toISOString()
    const normalizedDateTo = new Date(dateTo).toISOString()

    const usage: Array<{
      month: number
      year: number
      model_id: string
      caps: number
      requests: bigint
      used_accounts: bigint
    }> = await db.client.$queryRaw`
      SELECT
        EXTRACT(MONTH FROM a.created_at) AS month,
        EXTRACT(YEAR FROM a.created_at) AS year,
        a.model_id as model_id,
        SUM(t.amount) AS caps,
        COUNT(1) AS requests,
        COUNT(DISTINCT(a.meta->'g4f_account_id')) AS used_accounts
      FROM "Action" AS a 
      INNER JOIN transactions AS t ON a.transaction_id = t.id
      WHERE 
        t.provider = 'BOTHUB' AND 
        t.type ='WRITE_OFF' AND 
        t.status = 'SUCCEDED' AND 
        t.currency = 'BOTHUB_TOKEN' AND 
        t.deleted = false AND
        t.created_at between ${normalizedDateFrom}::TIMESTAMP AND ${normalizedDateTo}::TIMESTAMP AND
        a.model_id IS NOT NULL AND
        a.provider_id = ${config.model_providers.g4f.id}
      GROUP BY month, year, a.model_id
      ORDER BY year ASC, month ASC, a.model_id ASC
    `

    return usage.map((usage) => ({
      month: usage.month,
      year: usage.year,
      usage: {
        model: {
          id: usage.model_id,
          caps: usage.caps,
          requests: usage.requests,
          usedAccounts: usage.used_accounts,
        },
      },
    }))
  }
}
