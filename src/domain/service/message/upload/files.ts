import { Adapter } from '@/domain/types'
import { IFile, RawFile } from '@/domain/entity/file'
import { IMessageImage } from '@/domain/entity/message-image'
import { InternalError } from '@/domain/errors'
import { FileType, MessageButtonAction } from '@prisma/client'
import { extname } from 'path'
import { isImage } from '@/lib'
import { IUser } from '@/domain/entity/user'
import { FileService } from '../../file'

type Params = Adapter & {
  fileService: FileService
}

export type UploadFiles = (params: {
  files: RawFile[]
  user: IUser
  keyEncryptionKey: string | null
}) => Promise<{
  userMessageImages: IMessageImage[]
  userMessageAttachmentsFiles: IFile[]
}>

export const buildUploadFiles = ({
  imageGateway,
  fileRepository,
  messageImageRepository,
  cryptoGateway,
  fileService,
}: Params): UploadFiles => {
  return async ({ files, user, keyEncryptionKey }) => {
    const images = files.filter((file) => isImage(file.originalname))
    const documents = files.filter((file) => !isImage(file.originalname))

    let dek = null
    if (user.encryptedDEK && user.useEncryption && keyEncryptionKey) {
      dek = await cryptoGateway.decryptDEK({
        edek: user.encryptedDEK,
        kek: keyEncryptionKey,
      })
    }

    const userMessageOriginalImagesFileAndMetadata = await Promise.all(
      images.map(async ({ originalname, buffer }) => {
        const { path, isEncrypted } = await fileService.write({
          buffer,
          ext: extname(originalname),
          dek,
        })

        return Promise.all([
          imageGateway.metadata({
            buffer,
          }),
          fileRepository.create({
            data: {
              type: FileType.IMAGE,
              path,
              isEncrypted,
            },
          }),
        ])
      }),
    )
    const userMessageOriginalImagesMetadata = userMessageOriginalImagesFileAndMetadata.map(
      ([metadata]) => metadata,
    )
    const userMessageOriginalImagesFile = userMessageOriginalImagesFileAndMetadata.map(
      ([, file]) => file,
    )

    const userMessagePreviewImagesResizeResult = await Promise.all(
      images.map(({ buffer }) =>
        imageGateway.resize({
          buffer,
          height: images.length === 1 ? 384 : 256,
        }),
      ),
    )
    const userMessagePreviewImagesBuffer = userMessagePreviewImagesResizeResult.map(
      ({ buffer }) => buffer,
    )
    const userMessagePreviewImagesMetadata = userMessagePreviewImagesResizeResult.map(
      ({ info }) => info,
    )

    const userMessagePreviewImagesWriteResult = await Promise.all(
      userMessagePreviewImagesBuffer.map(async (buffer, index) => {
        return fileService.write({
          buffer,
          ext: extname(images[index].originalname),
          dek,
        })
      }),
    )

    const userMessagePreviewImagesFile = await Promise.all(
      userMessagePreviewImagesWriteResult.map(({ path, isEncrypted }) =>
        fileRepository.create({
          data: {
            type: FileType.IMAGE,
            path,
            isEncrypted,
          },
        }),
      ),
    )

    const [userMessageImages, userMessageAttachmentsFiles] = await Promise.all([
      Promise.all(
        images.map((_, index) => {
          const originalFile = userMessageOriginalImagesFile[index]
          const { width: originalWidth = 512, height: originalHeight = 512 } =
            userMessageOriginalImagesMetadata[index]
          const previewFile = userMessagePreviewImagesFile[index]
          const { width: previewWidth, height: previewHeight } =
            userMessagePreviewImagesMetadata[index]

          if (!originalFile || !previewFile) {
            throw new InternalError()
          }

          return messageImageRepository.create({
            data: {
              width: originalWidth,
              height: originalHeight,
              preview_width: previewWidth,
              preview_height: previewHeight,
              original: {
                connect: {
                  id: originalFile.id,
                },
              },
              preview: {
                connect: {
                  id: previewFile.id,
                },
              },
              buttons: {
                createMany: {
                  data: [
                    {
                      action: MessageButtonAction.DOWNLOAD,
                    },
                  ],
                },
              },
            },
          })
        }),
      ),
      Promise.all(
        documents.map(async (document) => {
          const { path, isEncrypted } = await fileService.write({
            buffer: document.buffer,
            ext: extname(document.originalname),
            dek,
          })

          const file = await fileRepository.create({
            data: {
              type: FileType.DOCUMENT,
              name: document.originalname,
              path: path,
              size: document.buffer.byteLength,
              isEncrypted,
            },
          })

          if (!file) {
            throw new InternalError()
          }

          return file
        }),
      ),
    ])

    return { userMessageImages, userMessageAttachmentsFiles }
  }
}
