import { PrismaClient } from '@prisma/client'
import chalk from 'chalk'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: [
    {
      emit: 'event',
      level: 'query'
    },
    {
      emit: 'stdout',
      level: 'error'
    },
    {
      emit: 'stdout',
      level: 'info'
    },
    {
      emit: 'stdout',
      level: 'warn'
    }
  ]
})

prisma.$on('query', (error) => {
  console.log(
    chalk.blue.bold('[Bothub Server]'),
    `Query: ${error.query}.\n\tParams: ${error.params}.\n\tDuration: ${chalk.blue(`${error.duration}ms`)}.`
  )
})

async function main() {
  const result = await prisma.$executeRawUnsafe(`
    UPDATE subscriptions
    SET balance      = balance + credit_limit,
        credit_limit = 0
    WHERE credit_limit != 0
      AND payment_plan = 'CREDIT'
      AND enterprise_id IS NOT NULL;
  `)

  console.log(chalk.green(`[Bothub Server]`), `Обновлено записей: ${result}`)
}

main()
  .then(() => {
    console.log(chalk.blue.bold('[Bothub Server]'), 'Script update balances was executed successfully.')
  })
  .catch((error) => {
    console.error(error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
