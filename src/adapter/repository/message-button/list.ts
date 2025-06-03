import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IMessageButton } from '@/domain/entity/messageButton'

type Params = Pick<AdapterParams, 'db'>

export type List = (data: Prisma.MessageButtonFindManyArgs) => Promise<Array<IMessageButton> | never>

export const buildList = ({ db }: Params): List => {
  return async (data) => {
    return db.client.messageButton.findMany(data)
  }
}
