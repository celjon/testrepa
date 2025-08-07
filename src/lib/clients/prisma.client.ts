import { Prisma, PrismaClient } from '@prisma/client'

export type PrismaClientWithExtensions = ReturnType<typeof newClient>['client']

export const newClient = (config: {
  user: string
  password: string
  port: number
  host: string
  db: string
}) => {
  const excludePasswordMiddleware: Prisma.Middleware = async (params, next) => {
    const result = await next(params)

    if (result && params?.model === 'User' && params?.args?.select?.password !== true) {
      delete result.password
    }
    return result
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url: `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.db}?connection_limit=10`,
      },
    },
  })

  client.$use(excludePasswordMiddleware)

  const getContextClient = (tx?: unknown) => {
    if (tx) {
      return tx as unknown as PrismaClientWithExtensions
    }
    return client
  }

  return {
    client,
    getContextClient,
  }
}
