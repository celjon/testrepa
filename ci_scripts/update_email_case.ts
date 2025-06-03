import { Pool } from 'pg'
import Cursor from 'pg-cursor'
import chalk from 'chalk'

interface User {
  inactive: boolean
  disabled: boolean
  id: string
  email: string
}

interface UserWithSubscriptionAndPlan extends User {
  tokens: number
  plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'DELUXE' | 'ELITE'
}

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT } = process.env

const powers = {
  FREE: 1,
  BASIC: 2,
  PREMIUM: 3,
  DELUXE: 4,
  ELITE: 5
}

function isBetterThen(user1: UserWithSubscriptionAndPlan, user2: UserWithSubscriptionAndPlan): boolean {
  if ((user2.disabled || user2.inactive) && !user1.disabled && !user1.inactive) return true
  if ((user1.disabled || user1.inactive) && !user2.disabled && !user2.inactive) return false

  if (user1.tokens > user2.tokens) return true
  if (user1.tokens <= user2.tokens) return false

  if (powers[user1.plan] > powers[user2.plan]) return true
  else return false
}

async function getUser(pool: Pool, email: string): Promise<User> {
  const query = 'select id, email from users where email = $1'
  const { rows: userDto } = await pool.query(query, [email])
  return userDto[0]
}

async function getUserWithSubscription(pool: Pool, email: string): Promise<UserWithSubscriptionAndPlan> {
  const query = `
    select us.id, us.email, us.disabled, us.inactive, us.tokens, pl.type as plan
    from (
      select u.id, u.email, u.inactive, u.disabled, s.tokens, s.plan_id 
      from users u join subscriptions s 
      on u.id = s.user_id 
      where u.email = $1
    ) us join plans pl 
    on us.plan_id = pl.id;`
  const { rows: userDto } = await pool.query(query, [email])
  return userDto[0]
}

async function main() {
  const pool = new Pool({
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    host: POSTGRES_HOST,
    port: parseInt(POSTGRES_PORT!),
    database: POSTGRES_DB
  })
  const client = await pool.connect()

  process.stdout.write(chalk.blue.bold('[Bothub Server] ') + 'Script started\n')

  const baseQuery = "select id, email, inactive, disabled from users where email ~ '[A-Z]'"

  const cursor = client.query(new Cursor<User>(baseQuery))

  try {
    // eslint-disable-next-line
    while (true) {
      const rows = await cursor.read(1)

      if (rows.length === 0) break

      await Promise.all(
        rows.map((user) =>
          (async () => {
            const lowerEmail = user.email.toLowerCase()

            const userWithLowerEmailPartial = await getUser(pool, lowerEmail)

            if (userWithLowerEmailPartial) {
              process.stdout.write(`${chalk.bold.red('duplicate:')} ${user.email}\n`)

              const [userWithLowerEmail, userWithUpperEmail] = await Promise.all([
                getUserWithSubscription(pool, lowerEmail),
                getUserWithSubscription(pool, user.email)
              ])

              let idForRemoval
              let idForUpdate

              if (isBetterThen(userWithLowerEmail, userWithUpperEmail)) {
                idForRemoval = userWithUpperEmail.id
                idForUpdate = userWithLowerEmail.id
              } else {
                idForRemoval = userWithLowerEmail.id
                idForUpdate = userWithUpperEmail.id
              }

              await pool.query('update users set email = null, tg_id = null where id = $1', [idForRemoval])
              await pool.query('update users set email = $1 where id = $2', [lowerEmail, idForUpdate])
            } else {
              await pool.query('update users set email = $1 where id = $2', [lowerEmail, user.id])
            }
          })()
        )
      )
    }
  } finally {
    await cursor.close()
    client.release()
    await pool.end()
  }
}

main()
  .then(() => {
    process.stdout.write(chalk.blue.bold('[Bothub Server] ') + 'Script was executed successfully.')
  })
  .catch((error) => {
    process.stderr.write(error)
  })
