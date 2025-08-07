import { Prisma } from '@prisma/client'
import { Adapter } from '@/domain/types'
import { IMessage } from '@/domain/entity/message'
import { IUser } from '@/domain/entity/user'
import { DecryptMessage } from './decrypt/decrypt-message'

type Params = Adapter & {
  decryptMessage: DecryptMessage
}

export type Get = (
  params: {
    user: IUser
    keyEncryptionKey: string | null
    data: Prisma.MessageFindFirstArgs
  },
  tx?: unknown,
) => Promise<IMessage | null | never>

export const buildGet = ({ messageRepository, decryptMessage, cryptoGateway }: Params): Get => {
  return async ({ user, keyEncryptionKey, data }, tx) => {
    const message = await messageRepository.get(data, tx)

    if (!user.encryptedDEK || !keyEncryptionKey || !message) {
      return message
    }

    const dek = await cryptoGateway.decryptDEK({
      kek: keyEncryptionKey,
      edek: user.encryptedDEK,
    })

    return decryptMessage({ dek, message })
  }
}
