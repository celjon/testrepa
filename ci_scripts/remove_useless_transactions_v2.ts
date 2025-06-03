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
  process.stdout.write(chalk.blue.bold('[Bothub Server] ') + 'Script started\n')

  const [, , enterpriseName, ownerEmail] = process.argv

  if (!enterpriseName || !ownerEmail) {
    await prisma.$disconnect()
    throw new Error(chalk`{red enterprise name and owner email needed in process.argv}`)
  }

  await prisma.$executeRaw`
    update transactions set deleted = true 
    where enterprise_id = (
      select id from enterprises 
      where name = ${enterpriseName}
    ) and 
    user_id != (
      select id from users 
      where email = ${ownerEmail}
    ) and 
    currency = 'BOTHUB_TOKEN' and 
    provider = 'BOTHUB'
  `
}

main()
  .then(() => {
    console.log(chalk.blue.bold('[Bothub Server]'), 'Script was executed successfully.')
  })
  .catch((error) => {
    console.error(error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
