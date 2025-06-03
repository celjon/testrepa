import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IMessage } from '@/domain/entity/message'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.MessageDeleteArgs) => Promise<IMessage | null | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data) => {
    return (await db.client.message.delete(data)) as IMessage
  }
}
