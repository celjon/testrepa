import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IMessage } from '@/domain/entity/message'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.MessageFindManyArgs) => Promise<Array<IMessage> | never>

export const buildList = ({ db }: Params): List => {
  // @ts-expect-error TODO fix types
  return async (data) => {
    return db.client.message.findMany(data)
  }
}
