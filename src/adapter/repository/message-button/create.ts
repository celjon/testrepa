import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IMessageButton } from '@/domain/entity/messageButton'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.MessageButtonCreateArgs) => Promise<IMessageButton | never>
export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const messageButton = await db.client.messageButton.create(data)

    return messageButton
  }
}
