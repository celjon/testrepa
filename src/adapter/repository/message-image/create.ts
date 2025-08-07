import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IMessageImage } from '@/domain/entity/message-image'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.MessageImageCreateArgs) => Promise<IMessageImage | never>
export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    const messageImage = await db.client.messageImage.create(data)

    return messageImage
  }
}
