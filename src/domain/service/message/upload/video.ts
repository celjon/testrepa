import { RawFile } from '@/domain/entity/file'
import { IUser } from '@/domain/entity/user'
import { IVideo } from '@/domain/entity/video'
import { FileType } from '@prisma/client'
import { extname } from 'path'
import { Adapter } from '@/adapter'
import { FileService } from '@/domain/service/file'

type Params = Adapter & {
  fileService: FileService
}

export type UploadVideo = (params: {
  videoFile?: RawFile | null
  user: IUser
  keyEncryptionKey: string | null
  temperature?: number
  prompt?: string
}) => Promise<{
  userMessageVideo: IVideo | null
}>

export const buildUploadVideo = ({
  assemblyAiGateway,
  mediaGateway,
  videoRepository,
  cryptoGateway,
  fileService,
}: Params): UploadVideo => {
  return async ({ videoFile, user, keyEncryptionKey, prompt, temperature }) => {
    if (!videoFile) {
      return {
        userMessageVideo: null,
      }
    }

    const videoFileBuffer = videoFile.buffer

    const { duration: videoDuration, content: videoTranscriptionResult } =
      await mediaGateway.getData({
        file: videoFile,
        assemblyAiGateway,
        prompt,
        temperature,
      })

    let videoContent = videoTranscriptionResult
    let dek = null
    let isEncrypted = false
    if (user.encryptedDEK && user.useEncryption && keyEncryptionKey) {
      dek = await cryptoGateway.decryptDEK({
        edek: user.encryptedDEK,
        kek: keyEncryptionKey,
      })

      videoContent = await cryptoGateway.encrypt({
        dek,
        data: videoContent,
      })
      isEncrypted = true
    }

    const { path, isEncrypted: isEncryptedFile } = await fileService.write({
      buffer: videoFileBuffer,
      ext: extname(videoFile.originalname),
      dek,
    })

    const userMessageVideo = await videoRepository.create({
      data: {
        content: videoContent,
        duration_seconds: videoDuration,
        isEncrypted: isEncrypted,
        file: {
          create: {
            type: FileType.VIDEO,
            name: videoFile.originalname,
            path: path,
            size: videoFile.size,
            isEncrypted: isEncryptedFile,
          },
        },
      },
    })

    userMessageVideo.content = videoTranscriptionResult
    userMessageVideo.isEncrypted = false

    return { userMessageVideo: userMessageVideo }
  }
}
