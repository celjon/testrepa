import { UseCaseParams } from '../types'
import { buildDecrypt, Decrypt } from './decrypt'

export type FileUseCase = {
  decrypt: Decrypt
}

export const buildFileUseCase = (params: UseCaseParams): FileUseCase => {
  const decrypt = buildDecrypt(params)

  return {
    decrypt
  }
}
