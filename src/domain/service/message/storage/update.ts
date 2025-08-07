import { Prisma } from '@prisma/client'
import { isString } from '@/lib'
import { Adapter } from '@/domain/types'
import { IMessage, ISearchResult } from '@/domain/entity/message'
import { IUser } from '@/domain/entity/user'
import { Get } from './get'
import { DecryptMessage } from './decrypt/decrypt-message'
import { NotFoundError } from '@/domain/errors'

type Params = Adapter & {
  get: Get
  decryptMessage: DecryptMessage
}

export type Update = (
  params: {
    user: IUser
    keyEncryptionKey: string | null
    data: Prisma.MessageUpdateArgs
  },
  tx?: unknown,
) => Promise<IMessage | null | never>

export const buildUpdate = ({
  messageRepository,
  get,
  decryptMessage,
  cryptoGateway,
}: Params): Update => {
  return async ({ user, keyEncryptionKey, data }, tx) => {
    // May cause inconsistencies if there are encrypted fields in DB but not in data.data
    if (!user.encryptedDEK || !keyEncryptionKey) {
      return messageRepository.update(data, tx)
    }

    const dek = await cryptoGateway.decryptDEK({
      kek: keyEncryptionKey,
      edek: user.encryptedDEK,
    })

    if (!hasDataForEncryption(data) || !user.useEncryption) {
      const updatedMessage = await messageRepository.update(data, tx)
      if (!updatedMessage) {
        return null
      }

      return decryptMessage({ dek, message: updatedMessage })
    }

    // Must return unencrypted message
    const storedMessage = await get(
      {
        user,
        keyEncryptionKey,
        data: {
          where: data.where,
        },
      },
      tx,
    )
    if (!storedMessage) {
      throw new NotFoundError({
        code: 'MESSAGE_NOT_FOUND',
        message: 'Message not found',
      })
    }

    // Avoid partial updates when for example storedMessage.content is not encrypted and data.data.full_content is encrypted.
    // We must keep them both encrypted or both unencrypted.
    const originalContent = data.data.content ?? storedMessage.content
    const originalFullContent = data.data.full_content ?? storedMessage.full_content
    const originalReasoningContent = data.data.reasoning_content ?? storedMessage.reasoning_content
    const originalSearchResults = data.data.search_results ?? storedMessage.search_results

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

    const updatedMessage = await messageRepository.update(data, tx)
    if (!updatedMessage) {
      return null
    }

    return decryptMessage({ dek, message: updatedMessage })
  }
}

const hasDataForEncryption = (data: Prisma.MessageUpdateArgs) => {
  return (
    isString(data.data.content) ||
    isString(data.data.full_content) ||
    isString(data.data.reasoning_content) ||
    Array.isArray(data.data.search_results)
  )
}
