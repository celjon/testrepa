import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IMessageImage } from '@/domain/entity/message-image'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.MessageImageFindManyArgs) => Promise<Array<IMessageImage> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    return db.client.messageImage.findMany(data)
  }
}
