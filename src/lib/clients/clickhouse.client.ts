import { ClickHouseClient, createClient } from '@clickhouse/client'

export type ClickhouseClientWithContext = ReturnType<typeof newClient>['client']

export const newClient = (config: {
  user: string
  protocol: string
  password: string
  url: string
  port: number
  db: string
}): {
  client: ClickHouseClient
} => {
  const client = createClient({
    url: `${config.protocol}://${config.url}:${config.port}`,
    username: config.user ?? 'clickhouse',
    password: config.password ?? '',
    database: config.db ?? 'bothubch',
  })

  return {
    client,
  }
}
