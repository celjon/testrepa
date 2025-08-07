import { Adapter } from '@/domain/types'
import { IMessage } from '@/domain/entity/message'
import { List } from './storage/list'
import { IUser } from '@/domain/entity/user'
import { MessageStorage } from './storage/types'

type Params = Adapter & {
  messageStorage: MessageStorage
}

export type Paginate = (data: {
  user: IUser
  keyEncryptionKey: string | null
  query: Parameters<List>[0]['data']
  page?: number
  quantity?: number
}) => Promise<
  | {
      data: Array<IMessage>
    }
  | never
>

export const buildPaginate = ({ messageStorage }: Params): Paginate => {
  return async ({ user, keyEncryptionKey, query, page, quantity = 20 }) => {
    if (typeof page != 'undefined' && page < 1) {
      return {
        data: [],
        pages: 0,
      }
    }

    const data = await messageStorage.list({
      user: user,
      keyEncryptionKey,
      data: {
        ...query,
        ...(page && { skip: (page - 1) * quantity }),
        ...(page && { take: quantity }),
      },
    })

    return {
      data,
    }
  }
}
