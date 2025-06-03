import { ModelAccountQueue, Prisma } from '@prisma/client'
import { IModelProvider } from './modelProvider'
import { IModelAccount } from './modelAccount'

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
          name: true
        }
      }
    }
  },
  accounts: {
    orderBy: {
      created_at: 'desc'
    },
    include: {
      g4f_har_file: true,
      models: {
        orderBy: {
          created_at: 'desc'
        },
        include: {
          model: true
        }
      }
    }
  }
}
