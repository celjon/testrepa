import { Currency, Plan, PlanType, PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { config as cfg } from '@/config'
import chalk from 'chalk'

export const plans: Array<Omit<Plan, 'id'>> = [
  {
    type: PlanType.FREE,
    price: cfg.plans['FREE'].price_usd,
    tokens: cfg.plans['FREE'].tokens,
    currency: Currency.USD,
  },
  {
    type: PlanType.BASIC,
    price: cfg.plans['BASIC'].price_usd,
    tokens: cfg.plans['BASIC'].tokens,
    currency: Currency.USD,
  },
  {
    type: PlanType.PREMIUM,
    price: cfg.plans['PREMIUM'].price_usd,
    tokens: cfg.plans['PREMIUM'].tokens,
    currency: Currency.USD,
  },
  {
    type: PlanType.FREE,
    price: cfg.plans['FREE'].price_rub,
    tokens: cfg.plans['FREE'].tokens,
    currency: Currency.RUB,
  },
  {
    type: PlanType.BASIC,
    price: cfg.plans['BASIC'].price_rub,
    tokens: cfg.plans['BASIC'].tokens,
    currency: Currency.RUB,
  },
  {
    type: PlanType.PREMIUM,
    price: cfg.plans['PREMIUM'].price_rub,
    tokens: cfg.plans['PREMIUM'].tokens,
    currency: Currency.RUB,
  },
  {
    type: PlanType.DELUXE,
    price: cfg.plans['DELUXE'].price_rub,
    tokens: cfg.plans['DELUXE'].tokens,
    currency: Currency.RUB,
  },
  {
    type: PlanType.DELUXE,
    price: cfg.plans['DELUXE'].price_usd,
    tokens: cfg.plans['DELUXE'].tokens,
    currency: Currency.USD,
  },
  {
    type: PlanType.DELUXE,
    price: cfg.plans['DELUXE'].price_usd,
    tokens: cfg.plans['DELUXE'].tokens,
    currency: Currency.EUR,
  },
  {
    type: PlanType.ELITE,
    price: cfg.plans['ELITE'].price_rub,
    tokens: cfg.plans['ELITE'].tokens,
    currency: Currency.RUB,
  },
  {
    type: PlanType.ELITE,
    price: cfg.plans['ELITE'].price_usd,
    tokens: cfg.plans['ELITE'].tokens,
    currency: Currency.USD,
  },
  {
    type: PlanType.ELITE,
    price: cfg.plans['ELITE'].price_usd,
    tokens: cfg.plans['ELITE'].tokens,
    currency: Currency.EUR,
  },
]

const users: Array<{
  email: string
  password: string
  role: Role
  emailVerified: boolean
}> = [
  {
    email: 'admin@admin.ru',
    password: bcrypt.hashSync(cfg.admin.password, 10) as string,
    role: Role.ADMIN,
    emailVerified: true,
  },
]

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL as string,
    },
  },
})

async function main() {
  const jobs = []

  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i]
    jobs.push(
      prisma.plan.upsert({
        where: {
          planUnique: {
            type: plan.type,
            currency: plan.currency,
          },
        },
        create: plan,
        update: {},
      }),
    )
  }

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    jobs.push(
      prisma.user.upsert({
        where: {
          email: user.email,
        },
        create: user,
        update: {
          password: user.password,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      }),
    )
  }

  await Promise.all(jobs)
}

main()
  .then(() => {
    console.log(chalk.blue.bold('[Bothub Server]'), 'Sucessfully seeded.')
  })
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
