import { extname } from 'path'
import { Readable } from 'stream'
import { RawFile } from '@/domain/entity/file'
import { IUser } from '@/domain/entity/user'
import { IVoice } from '@/domain/entity/voice'
import { Adapter } from '@/domain/types'
import { FileType } from '@prisma/client'
import { FileService } from '../../file'

type Params = Adapter & {
  fileService: FileService
}

export type UploadVoice = (params: {
  voiceFile?: RawFile | null
  user: IUser
  keyEncryptionKey: string | null
  temperature?: number
  prompt?: string
}) => Promise<{
  userMessageVoice: IVoice | null
}>

export const buildUploadVoice = ({ assemblyAiGateway, mediaGateway, voiceRepository, cryptoGateway, fileService }: Params): UploadVoice => {
  return async ({ voiceFile, user, keyEncryptionKey, temperature, prompt }) => {
    if (!voiceFile) {
      return {
        userMessageVoice: null
      }
    }

    const voiceFileBuffer = voiceFile.buffer
    const voiceFileReadable = new Readable()

    voiceFileReadable.push(voiceFileBuffer)
    voiceFileReadable.push(null)
    const {
      waveData: voiceWaveData,
      duration: voiceDuration,
      content: voiceTranscriptionResult
    } = await mediaGateway.getData({ assemblyAiGateway, file: voiceFile, temperature, prompt })

    let isEncrypted = false
    let voiceContent = voiceTranscriptionResult

    let dek = null
    if (user.encryptedDEK && user.useEncryption && keyEncryptionKey) {
      dek = await cryptoGateway.decryptDEK({
        edek: user.encryptedDEK,
        kek: keyEncryptionKey
      })

      voiceContent = await cryptoGateway.encrypt({
        dek,
        data: voiceContent
      })
      isEncrypted = true
    }

    const { path, isEncrypted: isEncryptedFile } = await fileService.write({
      buffer: voiceFileBuffer,
      ext: extname(voiceFile.originalname),
      dek
    })

    const userMessageVoice = await voiceRepository.create({
      data: {
        content: voiceContent,
        wave_data: voiceWaveData,
        duration_seconds: voiceDuration,
        isEncrypted,
        file: {
          create: {
            type: FileType.AUDIO,
            name: voiceFile.originalname,
            path: path,
            size: voiceFile.size,
            isEncrypted: isEncryptedFile
          }
        }
      }
    })

    userMessageVoice.content = voiceTranscriptionResult
    userMessageVoice.isEncrypted = false

    return { userMessageVoice }
  }
}
