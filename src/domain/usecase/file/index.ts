import { UseCaseParams } from '../types'
import { buildDecrypt, Decrypt } from './decrypt'
import { buildGeneratePresignedUrl, GeneratePresignedUrl } from './generatePresignedUrl'

export type FileUseCase = {
  decrypt: Decrypt
  generatePresignedUrl: GeneratePresignedUrl
}

export const buildFileUseCase = (params: UseCaseParams): FileUseCase => {
  const decrypt = buildDecrypt(params)
  const generatePresignedUrl = buildGeneratePresignedUrl(params)

  return {
    decrypt,
    generatePresignedUrl,
  }
}
