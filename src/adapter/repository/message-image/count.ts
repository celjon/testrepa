import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (data: Prisma.MessageImageCountArgs) => Promise<number | never>
export const buildCount = ({ db }: Params): Count => {
  return async (data) => {
    const messageImage = await db.client.messageImage.count(data)

    return messageImage
  }
}
