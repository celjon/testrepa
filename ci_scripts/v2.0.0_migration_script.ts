import { PrismaClient } from '@prisma/client'
import chalk from 'chalk'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
})

prisma.$on('query', (error) => {
  console.log(
    chalk.blue.bold('[Bothub Server]'),
    `Query: ${error.query}.\n\tParams: ${error.params}.\n\tDuration: ${chalk.blue(`${error.duration}ms`)}.`,
  )
})

async function main() {
  await prisma.$transaction(async () => {
    await prisma.chat.updateMany({
      data: {
        model_id: 'gpt',
      },
    })

    const chatsSettings = await prisma.chatSettings.findMany()

    for (const chatSettings of chatsSettings) {
      await prisma.chatSettings.update({
        where: {
          id: chatSettings.id,
        },
        data: {
          text: {
            create: {
              model: 'gpt-3.5-turbo',
              system_prompt: '',
              system_prompt_tokens: 0,
              temperature: 0.7,
              top_p: 1,
              presence_penalty: 0,
              frequency_penalty: 0,
              max_tokens: 256,
              include_context: true,
              created_at: new Date(),
            },
          },
        },
      })
    }
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
