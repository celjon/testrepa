import { Currency, PrismaClient, TransactionProvider, TransactionStatus, TransactionType } from '@prisma/client'
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
  await prisma.$transaction(async (tx) => {
    const plan = await tx.plan.findFirst({
      where: {
        type: 'ELITE',
        currency: 'RUB'
      }
    })

    const enterprise = await tx.enterprise.create({
      data: {
        name: 'Big Company with many transactions!!!',
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

    await tx.employee.create({
      data: {
        user: {
          create: {
            email: 'big_comp_owner1_email@mail.com',
            emailVerified: true,
            password: 'owner1_email@mail.com'
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

    for (let i = 0; i < 100; i++) {
      await tx.employee.create({
        data: {
          user: {
            create: {
              email: `big_comp_email${i}@mail.com`,
              emailVerified: true,
              subscription: {
                create: {
                  balance: 1000,
                  plan: {
                    connect: {
                      id: plan!.id
                    }
                  }
                }
              }
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

    for (let j = 0; j < 10; j++) {
      const user = await tx.user.findFirst({ where: { email: `big_comp_email${j}@mail.com` } })

      const transactionData = Array.from({ length: 25000 }, () => ({
        amount: Math.trunc(Math.random() * 1000),
        enterprise_id: enterprise.id,
        user_id: user?.id,
        provider: TransactionProvider.BOTHUB,
        currency: Currency.BOTHUB_TOKEN,
        status: TransactionStatus.SUCCEDED,
        type: TransactionType.WRITE_OFF
      }))

      const transactionData1 = Array.from({ length: 25000 }, () => ({
        amount: Math.trunc(Math.random() * 1000),
        enterprise_id: enterprise.id,
        user_id: user?.id,
        provider: TransactionProvider.BOTHUB,
        currency: Currency.BOTHUB_TOKEN,
        status: TransactionStatus.SUCCEDED,
        type: TransactionType.REPLINSH
      }))

      await tx.transaction.createMany({
        data: transactionData,
        skipDuplicates: true
      })
      await tx.transaction.createMany({
        data: transactionData1,
        skipDuplicates: true
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
