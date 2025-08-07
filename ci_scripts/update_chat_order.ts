import { Pool } from 'pg'
import Cursor from 'pg-cursor'
import chalk from 'chalk'

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT } = process.env

async function updateChatsOrder(pool: Pool, userId: string) {
  const updateQuery = `
    WITH ordered_chats AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY group_id ORDER BY created_at) - 1 AS new_order
      FROM chats
      WHERE user_id = $1
    )
    UPDATE chats
    SET "order" = ordered_chats.new_order
    FROM ordered_chats
    WHERE chats.id = ordered_chats.id
  `

  await pool.query(updateQuery, [userId])
}

async function updateGroupsOrder(pool: Pool, userId: string) {
  const updateQuery = `
    WITH ordered_groups AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS new_order
      FROM groups
      WHERE user_id = $1
    )
    UPDATE groups
    SET "order" = ordered_groups.new_order
    FROM ordered_groups
    WHERE groups.id = ordered_groups.id
  `

  await pool.query(updateQuery, [userId])
}

async function main() {
  const pool = new Pool({
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    host: POSTGRES_HOST,
    port: parseInt(POSTGRES_PORT!),
    database: POSTGRES_DB,
  })
  const client = await pool.connect()

  process.stdout.write(chalk.blue.bold('[Bothub Server] ') + 'Script started\n')

  const baseQuery = `
    SELECT id
    FROM users
  `

  const cursor = client.query(new Cursor<any>(baseQuery))

  try {
    // eslint-disable-next-line
    while (true) {
      const rows = await cursor.read(100)

      if (rows.length === 0) break

      await Promise.all(
        rows.map(async (user) => {
          const userId = user.id

          await updateChatsOrder(pool, userId)
          await updateGroupsOrder(pool, userId)

          process.stdout.write(chalk.green(`Completed processing user: ${userId}\n`))
        }),
      )
    }
  } finally {
    await cursor.close()
    client.release()
    await pool.end()
  }

  process.stdout.write(chalk.blue.bold('[Bothub Server] ') + 'Script completed successfully.\n')
}

main()
  .then(() => {
    process.stdout.write(
      chalk.blue.bold('[Bothub Server] ') + 'Script was executed successfully.\n',
    )
  })
  .catch((error) => {
    process.stderr.write(chalk.red.bold('Error: ') + error.message + '\n')
  })
