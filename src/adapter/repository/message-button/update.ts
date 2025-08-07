import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IMessageButton } from '@/domain/entity/message-button'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.MessageButtonUpdateArgs) => Promise<IMessageButton | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const messageButton = await db.client.messageButton.update(data)

    return messageButton
  }
}
