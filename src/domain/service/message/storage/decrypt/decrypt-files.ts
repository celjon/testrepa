import { IMessage } from '@/domain/entity/message'
import { FileService } from '@/domain/service/file'

type DecryptMediaParams = {
  message: IMessage
  dek: Buffer
  fileService: FileService
  type: 'voice' | 'video'
}

export const decryptMedia = async ({ message, dek, fileService, type }: DecryptMediaParams) => {
  if (!message[type] || !message[type].file) {
    return
  }

  message[type].file = await fileService.decrypt({
    file: message[type].file,
    dek,
  })
}

export const decryptImages = async (message: IMessage, dek: Buffer, fileService: FileService) => {
  if (message.images) {
    message.images = await Promise.all(
      message.images.map(async (image) => {
        const [original, preview] = await Promise.all([
          fileService.decrypt({
            file: image.original,
            dek,
          }),
          fileService.decrypt({
            file: image.preview,
            dek,
          }),
        ])

        return {
          ...image,
          original,
          preview,
        }
      }),
    )
  }
}
