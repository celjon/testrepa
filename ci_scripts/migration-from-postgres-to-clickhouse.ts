import {
  Currency,
  EnterprisePaymentPlanStatus,
  PrismaClient,
  TransactionType,
} from '@prisma/client'
import { createClient } from '@clickhouse/client'
import chalk from 'chalk'
import { toCHDateTime } from '../src/lib/utils/to-ch-date-time'
import { runWithConcurrencyLimit } from '../src/lib/utils/run-with-concurrency-limit'
import { mapPrismaToCH } from '../src/adapter/repository/transaction/clickhouse-types'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
  log: [
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
    { emit: 'stdout', level: 'error' },
    { emit: 'event', level: 'query' },
  ],
})

prisma.$on('query', (e) => {
  console.log(
    chalk.blue.bold('[Postgres]'),
    `Query: ${e.query}`,
    `Params: ${e.params}`,
    `Duration: ${chalk.blue(e.duration + 'ms')}`,
  )
})

async function saveLastMigrationDate(date: Date) {
  await prisma.$executeRaw`
    INSERT INTO clickhouse (id, last_migration)
    VALUES ('transactions', ${date}) ON CONFLICT (id) DO
    UPDATE
      SET last_migration = EXCLUDED.last_migration
  `
}

async function loadLastMigrationDate(): Promise<Date | null> {
  const result = await prisma.$queryRaw<{ last_migration: Date }[]>`
    SELECT last_migration
    FROM clickhouse
    WHERE id = 'transactions'
  `
  return result[0]?.last_migration ?? null
}

const ch = createClient({
  url: `http://${process.env.CLICKHOUSE_HOST}:${process.env.CLICKHOUSE_PORT}`,
  username: process.env.CLICKHOUSE_USER,
  password: process.env.CLICKHOUSE_PASSWORD,
  database: process.env.CLICKHOUSE_DB,
})

const BATCH_SIZE = 20000
const PARALLEL_WORKERS = parseInt(process.env.PARALLEL_WORKERS || '4', 10)

async function getOffsets(afterDate: Date | null): Promise<number[]> {
  const where = afterDate
    ? {
        currency: Currency.BOTHUB_TOKEN,
        created_at: { gt: afterDate },
      }
    : { currency: Currency.BOTHUB_TOKEN }
  const totalCount = await prisma.transaction.count({ where })
  return Array.from({ length: Math.ceil(totalCount / BATCH_SIZE) }, (_, i) => i * BATCH_SIZE)
}

async function migrateBatch(offset: number, afterDate: Date | null) {
  const whereClause = afterDate
    ? `WHERE t.currency = '${Currency.BOTHUB_TOKEN}' AND t.created_at > '${afterDate.toISOString()}'`
    : `WHERE t.currency = '${Currency.BOTHUB_TOKEN}'`

  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT t.id,
           t.amount,
           t.type,
           t.user_id,
           t.created_at,
           COALESCE(a.platform, 'WEB') AS platform,
           p.type                      AS plan_type,
           a.model_id,
           a.provider_id,
           t.developer_key_id,
           t.enterprise_id,
           model.features              AS model_features,
           t.from_user_id,
           t.referral_id,
           t.meta,
           a.meta                      AS action_meta,
           a.id                        AS action_id,
           s.payment_plan              AS payment_plan
    FROM transactions t
           LEFT JOIN "Action" a ON a.transaction_id = t.id
           LEFT JOIN models model ON a.model_id = model.id
           LEFT JOIN users u ON t.user_id = u.id
           LEFT JOIN subscriptions s ON s.user_id = u.id
           LEFT JOIN plans p ON s.plan_id = p.id
      ${whereClause}
    ORDER BY t.created_at ASC
      LIMIT ${BATCH_SIZE}
    OFFSET ${offset};
  `)

  if (rows.length === 0) return null

  const payload = rows.map((row) => {
    let txMeta: Record<string, any> = {}
    let actionMeta: Record<string, any> = {}

    try {
      txMeta = typeof row.meta === 'string' ? JSON.parse(row.meta) : row.meta || {}
    } catch (err) {
      console.warn('[WARN] Failed to parse tx.meta:', row.id, err)
    }

    try {
      actionMeta =
        typeof row.action_meta === 'string' ? JSON.parse(row.action_meta) : row.action_meta || {}
    } catch (err) {
      console.warn('[WARN] Failed to parse action.meta:', row.id, err)
    }
    let source: EnterprisePaymentPlanStatus | null = null

    if (txMeta.source) {
      source = txMeta.source
    } else {
      source = null
    }

    return {
      id: row.id,
      amount: row.amount,
      type: mapPrismaToCH[row.type as TransactionType],
      user_id: row.user_id ?? '',
      created_at: toCHDateTime(row.created_at),
      platform: row.platform ?? null,
      plan_type: row.plan_type ?? null,
      model_id: row.model_id ?? null,
      provider_id: row.provider_id ?? null,
      plan_id: row.plan_id ?? null,
      model_features: row.model_features ?? [],
      developer_key_id: row.developer_key_id,
      enterprise_id: row.enterprise_id ?? '',
      g4f_account_id: actionMeta.g4f_account_id ?? null,
      from_user_id: row.from_user_id,
      referral_id: row.referral_id,
      web_search: txMeta.expense_details?.web_search
        ? Number(txMeta.expense_details?.web_search)
        : null,
      source,
      action_id: row.action_id,
      credit_spent: txMeta.expense_details?.credit_spent ?? null,
    }
  })

  await ch.insert({
    table: process.env.CLICKHOUSE_DB + '.transactions',
    format: 'JSONEachRow',
    values: payload,
  })

  const lastCreatedAt = new Date(rows[rows.length - 1].created_at)
  await saveLastMigrationDate(lastCreatedAt)

  console.log(
    chalk.green(`[Batch offset ${offset}]`),
    `rows=${rows.length}, lastCreatedAt=${lastCreatedAt.toISOString()}`,
  )

  return true
}

async function main() {
  console.log(chalk.blue.bold('[Migration]'), 'Start migrating...')

  const afterDate = await loadLastMigrationDate()
  const offsets = await getOffsets(afterDate)

  await runWithConcurrencyLimit(PARALLEL_WORKERS, offsets, async (offset) => {
    const success = await migrateBatch(offset, afterDate)
    if (!success) {
      console.warn(chalk.yellow(`[Batch ${offset}]`), 'No data found.')
    }
  })

  console.log(chalk.blue.bold('[Migration]'), 'All done!')
}

main()
  .catch((err) => console.error(chalk.red('[Error]'), err))
  .finally(() => prisma.$disconnect())
