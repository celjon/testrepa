import { AdapterParams } from '@/adapter/types'
import { IMessageSet } from '@/domain/entity/messageSet'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.MessageSetFindUniqueArgs) => Promise<IMessageSet | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    return db.client.messageSet.findUnique(data)
  }
}
