import { ModelAccountQueue, Prisma } from '@prisma/client'
import { IModelProvider } from './model-provider'
import { IModelAccount } from './model-account'

export interface IModelAccountQueue extends ModelAccountQueue {
  provider?: IModelProvider
  accounts?: IModelAccount[]
  active_account?: IModelAccount | null
}

export const modelAccountQueueInclude: Prisma.ModelAccountQueueInclude = {
  provider: {
    include: {
      parent: {
        select: {
          id: true,
          label: true,
          name: true,
        },
      },
    },
  },
  accounts: {
    orderBy: [
      {
        name: 'asc',
      },
      {
        created_at: 'desc',
      },
    ],
    omit: {
      g4f_password: true,
      g4f_email_password: true,
    },
    include: {
      g4f_har_file: true,
      models: {
        orderBy: {
          created_at: 'desc',
        },
        include: {
          model: true,
        },
      },
    },
  },
}
