import { isString } from '@/lib'
import { IMessage, ISearchResult } from '@/domain/entity/message'
import { Adapter } from '@/domain/types'
import { FileService } from '../../../file'
import { decryptImages, decryptMedia } from '@/domain/service/message/storage/decrypt/decrypt-files'

type Params = Adapter & {
  fileService: FileService
}

export type DecryptMessage = (params: { dek: Buffer; message: IMessage }) => Promise<IMessage>

export const buildDecryptMessage = (params: Params): DecryptMessage => {
  const { cryptoGateway, fileService } = params

  return async ({ dek, message }) => {
    // decrypt text content
    if (message.isEncrypted) {
      if (isString(message.content)) {
        message.content = await cryptoGateway.decrypt({
          dek,
          encryptedData: message.content,
        })
      }
      if (isString(message.full_content)) {
        message.full_content = await cryptoGateway.decrypt({
          dek,
          encryptedData: message.full_content,
        })
      }
      if (isString(message.reasoning_content)) {
        message.reasoning_content = await cryptoGateway.decrypt({
          dek,
          encryptedData: message.reasoning_content,
        })
      }
      if (Array.isArray(message.search_results)) {
        message.search_results = await Promise.all(
          message.search_results?.map(
            async (searchResult: ISearchResult): Promise<ISearchResult> => {
              return {
                ...searchResult,
                url: await cryptoGateway.decrypt({
                  dek,
                  encryptedData: searchResult.url,
                }),
                title: await cryptoGateway.decrypt({
                  dek,
                  encryptedData: searchResult.title,
                }),
                snippet: await cryptoGateway.decrypt({
                  dek,
                  encryptedData: searchResult.snippet,
                }),
              }
            },
          ),
        )
      }
      message.isEncrypted = false
    }

    // decrypt transcribed voice content
    if (message.voice && message.voice.isEncrypted) {
      message.voice.content = await cryptoGateway.decrypt({
        dek,
        encryptedData: message.voice.content,
      })
      message.voice.isEncrypted = false
    }

    if (message.video && message.video.isEncrypted) {
      message.video.content = await cryptoGateway.decrypt({
        dek,
        encryptedData: message.video.content,
      })
      message.video.isEncrypted = false
    }

    // decrypt files
    await Promise.all([
      decryptImages(message, dek, fileService),
      decryptMedia({ message, dek, fileService, type: 'voice' }),
      decryptMedia({ message, dek, fileService, type: 'video' }),
    ])

    return message
  }
}
