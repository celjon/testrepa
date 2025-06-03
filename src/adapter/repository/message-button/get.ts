import { AdapterParams } from '@/adapter/types'
import { IMessageButton } from '@/domain/entity/messageButton'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.MessageButtonFindFirstArgs) => Promise<IMessageButton | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    return (await db.client.messageButton.findFirst(data)) as IMessageButton
  }
}
