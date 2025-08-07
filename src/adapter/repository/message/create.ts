import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IMessage, ISearchResult } from '@/domain/entity/message'
import { DefaultArgs } from '@prisma/client/runtime/library'

type Params = Pick<AdapterParams, 'db'>

export type Create = (
  data: Prisma.MessageCreateArgs<DefaultArgs>,
  tx?: unknown,
) => Promise<IMessage | never>
export const buildCreate = ({ db }: Params): Create => {
  return async (data, tx) => {
    const prismaMessage = await db.getContextClient(tx).message.create(data)

    const message: IMessage = {
      ...prismaMessage,
      search_results: prismaMessage.search_results
        ? (prismaMessage.search_results as ISearchResult[])
        : null,
    }

    return message
  }
}
