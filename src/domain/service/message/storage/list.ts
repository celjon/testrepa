import { Prisma } from '@prisma/client'
import { Adapter } from '@/domain/types'
import { IMessage } from '@/domain/entity/message'
import { IUser } from '@/domain/entity/user'
import { DecryptMessage } from './decrypt/decryptMessage'

type Params = Adapter & {
  decryptMessage: DecryptMessage
}

export type List = (params: {
  user: IUser
  keyEncryptionKey: string | null
  data: Prisma.MessageFindManyArgs
}) => Promise<Array<IMessage> | never>

export const buildList = ({ messageRepository, decryptMessage, cryptoGateway }: Params): List => {
  return async ({ user, keyEncryptionKey, data }) => {
    const messages = await messageRepository.list(data)

    if (!user.encryptedDEK || !keyEncryptionKey) {
      return messages
    }

    const dek = await cryptoGateway.decryptDEK({
      kek: keyEncryptionKey,
      edek: user.encryptedDEK as Buffer
    })

    const decryptedMessages = await Promise.all(messages.map((message) => decryptMessage({ dek, message })))

    return decryptedMessages
  }
}
