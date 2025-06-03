import { Prisma } from '@prisma/client'
import { isString } from '@/lib'
import { Adapter } from '@/domain/types'
import { IUser } from '@/domain/entity/user'
import { ISearchResult } from '@/domain/entity/message'

export type UpdateMany = (params: {
  user: IUser
  keyEncryptionKey: string | null
  data: Prisma.MessageUpdateManyArgs
  tx?: unknown
}) => Promise<Prisma.BatchPayload | never>

export const buildUpdateMany = ({ messageRepository, cryptoGateway }: Adapter): UpdateMany => {
  return async ({ user, keyEncryptionKey, data, tx }) => {
    if (!user.useEncryption || !user.encryptedDEK || !keyEncryptionKey) {
      return messageRepository.updateMany(data, tx)
    }

    const originalContent = data.data.content
    const originalFullContent = data.data.full_content
    const originalReasoningContent = data.data.reasoning_content
    const originalSearchResults = data.data.search_results

    if (!isString(originalContent) && !isString(originalFullContent) && !isString(originalReasoningContent)) {
      return messageRepository.updateMany(data, tx)
    }

    const dek = await cryptoGateway.decryptDEK({
      kek: keyEncryptionKey,
      edek: user.encryptedDEK
    })

    if (isString(originalContent)) {
      data.data.content = await cryptoGateway.encrypt({
        dek,
        data: originalContent
      })
      data.data.isEncrypted = true
    }
    if (isString(originalFullContent)) {
      data.data.full_content = await cryptoGateway.encrypt({
        dek,
        data: originalFullContent
      })
      data.data.isEncrypted = true
    }
    if (isString(originalReasoningContent)) {
      data.data.reasoning_content = await cryptoGateway.encrypt({
        dek,
        data: originalReasoningContent
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
              data: searchResult.url
            }),
            title: await cryptoGateway.encrypt({
              dek,
              data: searchResult.title
            }),
            snippet: await cryptoGateway.encrypt({
              dek,
              data: searchResult.snippet
            })
          }
        })
      )
      data.data.isEncrypted = true
    }

    return messageRepository.updateMany(data, tx)
  }
}
