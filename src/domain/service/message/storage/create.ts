import { Prisma } from '@prisma/client'
import { isString } from '@/lib'
import { Adapter } from '@/domain/types'
import { IMessage, ISearchResult } from '@/domain/entity/message'
import { IUser } from '@/domain/entity/user'
import { DecryptMessage } from './decrypt/decrypt-message'

type Params = Adapter & {
  decryptMessage: DecryptMessage
}

export type Create = (
  params: {
    user: IUser
    keyEncryptionKey: string | null
    data: Prisma.MessageCreateArgs
  },
  tx?: unknown,
) => Promise<IMessage | never>

export const buildCreate = ({
  messageRepository,
  chatRepository,
  decryptMessage,
  cryptoGateway,
}: Params): Create => {
  return async ({ user, keyEncryptionKey, data }, tx) => {
    if (!user.useEncryption || !user.encryptedDEK || !keyEncryptionKey) {
      await chatRepository.update({
        where: { id: data.data.chat_id },
        data: {
          last_message_at: new Date(),
        },
      })
      return messageRepository.create(data, tx)
    }

    const dek = await cryptoGateway.decryptDEK({
      kek: keyEncryptionKey,
      edek: user.encryptedDEK,
    })

    const originalContent = data.data.content
    const originalFullContent = data.data.full_content
    const originalReasoningContent = data.data.reasoning_content
    const originalSearchResults = data.data.search_results

    if (isString(originalContent)) {
      data.data.content = await cryptoGateway.encrypt({
        dek,
        data: originalContent,
      })
      data.data.isEncrypted = true
    }
    if (isString(originalFullContent)) {
      data.data.full_content = await cryptoGateway.encrypt({
        dek,
        data: originalFullContent,
      })
      data.data.isEncrypted = true
    }
    if (isString(originalReasoningContent)) {
      data.data.reasoning_content = await cryptoGateway.encrypt({
        dek,
        data: originalReasoningContent,
      })
      data.data.isEncrypted = true
    }
    if (Array.isArray(originalSearchResults)) {
      data.data.search_results = await Promise.all(
        originalSearchResults.map(async (searchResult: ISearchResult): Promise<ISearchResult> => {
          return {
            ...searchResult,
            url: await cryptoGateway.encrypt({
              dek,
              data: searchResult.url,
            }),
            title: await cryptoGateway.encrypt({
              dek,
              data: searchResult.title,
            }),
            snippet: await cryptoGateway.encrypt({
              dek,
              data: searchResult.snippet,
            }),
          }
        }),
      )
      data.data.isEncrypted = true
    }
    const createdMessage = await messageRepository.create(data, tx)
    await chatRepository.update({
      where: { id: createdMessage.chat_id },
      data: {
        last_message_at: new Date(),
      },
    })

    return decryptMessage({ dek, message: createdMessage })
  }
}
