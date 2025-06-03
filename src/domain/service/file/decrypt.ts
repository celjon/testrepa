import { extname } from 'path'
import { Adapter } from '@/domain/types'
import { IFile } from '@/domain/entity/file'

const longTermTTL = 24 * 60 * 60 * 1000 // Object expiration time in minio, ms
const shortTermTTL = 3 * 60 * 1000 // TTL of presigned URL, ms
const ttlMarginMs = 15_000

export type Decrypt = <F extends IFile | undefined>(params: { file: F; dek: Buffer }) => Promise<F>

export const buildDecrypt = ({ temporaryFileRepository, storageGateway, cryptoGateway }: Adapter): Decrypt => {
  return async ({ file, dek }) => {
    if (!file || !file.path || !file.isEncrypted) {
      return file
    }

    const shortTermFile = await temporaryFileRepository.get({
      originalPath: `short-${file.path}`
    })

    if (shortTermFile && shortTermFile.ttlMs > ttlMarginMs) {
      return {
        ...file,
        path: shortTermFile.path,
        isEncrypted: false
      }
    }

    const longTermFile = await temporaryFileRepository.get({
      originalPath: `long-${file.path}`
    })

    if (longTermFile && longTermFile.ttlMs > ttlMarginMs) {
      const shortTermPath = await storageGateway.getTemporaryPath({
        path: longTermFile.path,
        ttlMs: shortTermTTL + ttlMarginMs
      })

      await temporaryFileRepository.create({
        originalPath: `short-${file.path}`,
        decryptedPath: shortTermPath,
        ttlMs: Math.min(shortTermTTL, longTermFile.ttlMs)
      })

      return {
        ...file,
        path: shortTermPath,
        isEncrypted: false
      }
    }

    const encryptedBuffer = await storageGateway.read({
      path: file.path
    })

    if (encryptedBuffer.byteLength === 0) {
      return file
    }

    const decryptedBuffer = await cryptoGateway.decryptBytes({
      dek,
      encryptedData: encryptedBuffer
    })

    const tempFile = await storageGateway.writeTemporary({
      buffer: decryptedBuffer,
      ext: extname(file.path)
    })
    const longTermPath = tempFile.path

    const shortTermPath = await storageGateway.getTemporaryPath({
      path: longTermPath,
      ttlMs: shortTermTTL + 5000
    })

    await Promise.all([
      temporaryFileRepository.create({
        originalPath: `long-${file.path}`,
        decryptedPath: longTermPath,
        ttlMs: longTermTTL
      }),
      temporaryFileRepository.create({
        originalPath: `short-${file.path}`,
        decryptedPath: shortTermPath,
        ttlMs: shortTermTTL
      })
    ])

    return {
      ...file,
      path: shortTermPath,
      isEncrypted: false
    }
  }
}
