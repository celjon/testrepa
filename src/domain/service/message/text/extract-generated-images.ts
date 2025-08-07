import { extname } from 'path'
import { Adapter } from '@/domain/types'
import { IUser } from '@/domain/entity/user'
import { IMessageImage } from '@/domain/entity/message-image'
import { FileService } from '../../file'
import { FileType, MessageButtonAction } from '@prisma/client'

type Params = Pick<Adapter, 'imageGateway' | 'cryptoGateway' | 'messageImageRepository'> & {
  fileService: FileService
}

export const buildExtractGeneratedImages =
  ({ fileService, imageGateway, messageImageRepository, cryptoGateway }: Params) =>
  async ({
    user,
    keyEncryptionKey,
    messageId,
    content,
  }: {
    user: IUser
    keyEncryptionKey: string | null
    messageId: string
    content: string
  }) => {
    const imageURLs = extractGeneratedImageURLs(content)

    if (imageURLs.length === 0) {
      return []
    }

    let dek = null
    if (user.encryptedDEK && user.useEncryption && keyEncryptionKey) {
      dek = await cryptoGateway.decryptDEK({
        edek: user.encryptedDEK as Buffer,
        kek: keyEncryptionKey,
      })
    }

    const messageImages: IMessageImage[] = await Promise.all(
      imageURLs.map(async (imageURL) => {
        const ext = extname(imageURL.replace(/\?.*$/, ''))
        const buffer = await imageGateway.download({ url: imageURL })

        const originalImage = await fileService.write({
          buffer: buffer,
          ext: ext,
          dek,
        })

        const { width: originalImageWidth = 1024, height: originalImageHeight = 1024 } =
          await imageGateway.metadata({
            buffer: buffer,
          })

        const {
          buffer: previewImageBuffer,
          info: { width: previewImageWidth, height: previewImageHeight },
        } = await imageGateway.resize({
          buffer: buffer,
          width: 512,
        })

        const previewImage = await fileService.write({
          buffer: previewImageBuffer,
          ext: ext,
          dek,
        })

        const messageImage = await messageImageRepository.create({
          data: {
            message: {
              connect: {
                id: messageId,
              },
            },
            width: originalImageWidth,
            height: originalImageHeight,
            preview_width: previewImageWidth,
            preview_height: previewImageHeight,
            original: {
              create: {
                type: FileType.IMAGE,
                name: originalImage.name,
                path: originalImage.path,
                isEncrypted: originalImage.isEncrypted,
              },
            },
            preview: {
              create: {
                type: FileType.IMAGE,
                name: previewImage.name,
                path: previewImage.path,
                isEncrypted: previewImage.isEncrypted,
              },
            },
            buttons: {
              createMany: {
                data: [
                  {
                    message_id: messageId,
                    action: MessageButtonAction.DOWNLOAD,
                  },
                ],
              },
            },
          },
        })

        return messageImage
      }),
    )

    return messageImages
  }

const generatedImagesRegex =
  /<!-- generated images start -->([\s\S]*?)<!-- generated images end -->/
const urlRegex = /(https?:\/\/[^\s)"]+)/g

export const extractGeneratedImageURLs = (text: string): string[] => {
  const match = text.match(generatedImagesRegex)

  if (!match) {
    return []
  }

  const contentBetweenMarkers = match[1]

  const urls = contentBetweenMarkers.match(urlRegex) || []

  const uniqueUrls = [...new Set(urls)]

  return uniqueUrls
}
