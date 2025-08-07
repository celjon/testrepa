import { config } from '@/config'
import { AdapterParams } from '@/adapter/types'
import { G4FExtendedProductUsage } from '@/domain/entity/statistics'

type Params = Pick<AdapterParams, 'db'>

export type GetG4FExtendedProductUsage = (p: {
  dateFrom: string
  dateTo: string
}) => Promise<G4FExtendedProductUsage>

export const buildGetG4FExtendedProductUsage = ({ db }: Params): GetG4FExtendedProductUsage => {
  return async ({ dateTo, dateFrom }) => {
    const normalizedDateFrom = new Date(dateFrom).toISOString()
    const normalizedDateTo = new Date(dateTo).toISOString()

    const usage: Array<{
      date: string
      accountName: string
      model_id: string
      caps: number
      requests: bigint
    }> = await db.client.$queryRaw`
      SELECT
        TO_CHAR(a.created_at, 'DD.MM.YYYY') AS "date",
        COALESCE("ModelAccount".name, a.meta->>'g4f_account_id') as "accountName",
        a.model_id as model_id,
        SUM(t.amount) AS caps,
        COUNT(1) AS requests
      FROM "Action" AS a 
      INNER JOIN transactions AS t ON a.transaction_id = t.id
      LEFT JOIN "ModelAccount" ON "ModelAccount".id = a.meta->>'g4f_account_id'::text
      WHERE 
        t.provider = 'BOTHUB' AND 
        t.type ='WRITE_OFF' AND 
        t.status = 'SUCCEDED' AND 
        t.currency = 'BOTHUB_TOKEN' AND 
        t.deleted = false AND
        t.created_at between ${normalizedDateFrom}::TIMESTAMP AND ${normalizedDateTo}::TIMESTAMP AND
        a.model_id IS NOT NULL AND
        a.provider_id = ${config.model_providers.g4f.id}
      GROUP BY date, "ModelAccount".name, a.meta->>'g4f_account_id', a.model_id
      ORDER BY to_date(to_char(a.created_at, 'DD.MM.YYYY'), 'DD.MM.YYYY'), "ModelAccount".name, a.model_id ASC
    `

    return usage.map((usage) => ({
      date: usage.date,
      usage: {
        accountName: usage.accountName,
        model: {
          id: usage.model_id,
          caps: usage.caps,
          requests: usage.requests,
        },
      },
    }))
  }
}
