import { PresetAccess, PrismaClient } from '@prisma/client'
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
    const author = await prisma.user.findFirstOrThrow({
      where: {
        email: 'atmpotn@gmail.com'
      }
    })

    await Promise.all(
      [...Array(100)].map((_, index) =>
        prisma.preset.upsert({
          where: {
            id: `test-${index + 1}`
          },
          create: {
            name: `Test #${index + 1}`,
            description: '',
            access: PresetAccess.PUBLIC,
            model_id: 'gpt',
            author_id: author.id,
            created_at: new Date(Date.now() + index * 1000)
          },
          update: {}
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
