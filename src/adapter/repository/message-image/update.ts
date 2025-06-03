import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IMessageImage } from '@/domain/entity/messageImage'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.MessageImageUpdateArgs) => Promise<IMessageImage | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const messageImage = await db.client.messageImage.update(data)

    return messageImage
  }
}
