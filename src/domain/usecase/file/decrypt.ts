import { NotFoundError, UnauthorizedError } from '@/domain/errors'
import { IFile } from '@/domain/entity/file'
import { UseCaseParams } from '../types'

export type Decrypt = (params: {
  userId: string
  keyEncryptionKey: string | null
  fileId: string
}) => Promise<IFile>

export const buildDecrypt = ({ service, adapter }: UseCaseParams): Decrypt => {
  return async ({ userId, keyEncryptionKey, fileId }) => {
    const [user, file] = await Promise.all([
      adapter.userRepository.get({
        where: {
          id: userId,
        },
      }),
      adapter.fileRepository.get({
        where: {
          id: fileId,
        },
      }),
    ])

    if (!user) {
      throw new UnauthorizedError()
    }
    if (!user.encryptedDEK || !keyEncryptionKey) {
      throw new NotFoundError({ code: 'FILE_NOT_FOUND' })
    }

    if (!file) {
      throw new NotFoundError({ code: 'FILE_NOT_FOUND' })
    }

    const dek = await adapter.cryptoGateway.decryptDEK({
      edek: user.encryptedDEK,
      kek: keyEncryptionKey,
    })
    const decrypted = await service.file.decrypt({
      file,
      dek,
    })

    return decrypted
  }
}
