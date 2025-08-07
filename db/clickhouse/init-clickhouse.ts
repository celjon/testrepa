import chalk from 'chalk'
import { createClient } from '@clickhouse/client'

const CLICKHOUSE_HOST = process.env.CLICKHOUSE_HOST
const CLICKHOUSE_PORT = process.env.CLICKHOUSE_PORT
const CLICKHOUSE_USER = process.env.CLICKHOUSE_USER
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD
const CLICKHOUSE_DB = process.env.CLICKHOUSE_DB

const clickhouse = createClient({
  url: `http://${CLICKHOUSE_HOST}:${CLICKHOUSE_PORT}`,
  username: CLICKHOUSE_USER,
  password: CLICKHOUSE_PASSWORD,
})

async function init() {
  await clickhouse.command({
    query: `CREATE DATABASE IF NOT EXISTS ${CLICKHOUSE_DB}`,
  })

  await clickhouse.command({
    query: `
    CREATE TABLE IF NOT EXISTS ${CLICKHOUSE_DB}.transactions
    (
      id UUID,
      amount Float64,
    
      type Enum8('SUBSCRIPTION' = 1, 'WRITE_OFF' = 2, 'REPLENISH' = 3, 'WITHDRAW' = 4, 'REFERRAL_REWARD' = 5),
      user_id String, /*NON-NULLABLE FOR ORDER*/
      created_at DateTime,
      platform Nullable(Enum8(
        'WEB' = 1, 'MAIN' = 2, 'DASHBOARD' = 3, 'TELEGRAM' = 4, 'BOTHUB_API' = 5, 'API' = 6, 
        'API_COMPLETIONS' = 7, 'API_IMAGES' = 8, 'API_EMBEDDINGS' = 9, 'API_MODERATIONS' = 10, 
        'API_SPEECH' = 11, 'API_TRANSCRIPTIONS' = 12, 'API_TRANSLATIONS' = 13, 'ENTERPRISE' = 14, 
        'EASY_WRITER' = 15, 'PROMPT_QUEUE' = 16
      )),
      plan_type Nullable(Enum8('FREE' = 1, 'BASIC' = 2, 'PREMIUM' = 3, 'DELUXE' = 4, 'ELITE' = 5)),
      model_id Nullable(String),
      provider_id Nullable(String),
      plan_id Nullable(String),
      model_features Array(String),
      developer_key_id Nullable(UUID),
      enterprise_id String, /*NON-NULLABLE FOR ORDER*/
      g4f_account_id Nullable(String),
      from_user_id Nullable(UUID),
      referral_id Nullable(UUID),
      web_search Nullable(Float64),
      source Nullable(String),
      action_id Nullable(String),
      credit_spent Nullable(Float64)
    )
    ENGINE = MergeTree
    PARTITION BY toYYYYMM(created_at)
    ORDER BY (enterprise_id, user_id, created_at)
    `,
  })

  console.log(
    chalk.blue.bold('[Bothub ClickHouse]'),
    `Initialized ClickHouse database and transactions table.`,
  )
}

init()
  .catch((e) => {
    console.error(chalk.red.bold('[Bothub ClickHouse]'), e)
  })
  .finally(async () => {
    await clickhouse.close()
  })
