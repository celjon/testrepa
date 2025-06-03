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
    const plan = await prisma.plan.findFirst({
      where: {
        type: 'ELITE',
        currency: 'RUB'
      }
    })

    const enterprise = await prisma.enterprise.create({
      data: {
        name: 'Big Company with many eployees',
        subscription: {
          create: {
            balance: 1000000,
            plan: {
              connect: {
                id: plan!.id
              }
            }
          }
        }
      }
    })

    await prisma.employee.create({
      data: {
        user: {
          create: {
            email: 'owner_email@mail.com',
            emailVerified: true,
            password: '$2a$10$w6IF1wMtpyfPLOsTMmgl/.WGr/4bnaYkV7KUDE7mkSDyL9V87Z1TW'
          }
        },
        enterprise: {
          connect: {
            id: enterprise.id
          }
        },
        role: 'OWNER'
      }
    })

    for (let i = 0; i < 1000; i++) {
      await prisma.employee.create({
        data: {
          user: {
            create: {
              email: `email${i}@mail.com`,
              emailVerified: true
            }
          },
          enterprise: {
            connect: {
              id: enterprise.id
            }
          },
          role: 'EMPLOYEE'
        }
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
