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
  await prisma.$transaction(async () => {
    const models = await prisma.model.findMany()

    await prisma.employeeModel.deleteMany()
    await Promise.all(
      models.map((model) =>
        prisma.model.delete({
          where: {
            id: model.id
          }
        })
      )
    )
  })
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
