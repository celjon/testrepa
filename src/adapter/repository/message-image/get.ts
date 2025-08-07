import { AdapterParams } from '@/adapter/types'
import { IMessageImage } from '@/domain/entity/message-image'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.MessageImageFindFirstArgs) => Promise<IMessageImage | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    return (await db.client.messageImage.findFirst(data)) as IMessageImage
  }
}
