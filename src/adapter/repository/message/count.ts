import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (data: Prisma.MessageCountArgs) => Promise<number | never>
export const buildCount = ({ db }: Params): Count => {
  return async (data) => {
    const message = await db.client.message.count(data)

    return message
  }
}
