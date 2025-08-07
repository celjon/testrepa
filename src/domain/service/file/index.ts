import { Adapter } from '@/domain/types'
import { buildWrite, Write } from './write'
import { buildDecrypt, Decrypt } from './decrypt'

export type FileService = {
  write: Write
  decrypt: Decrypt
}

export const buildFileService = (params: Adapter): FileService => {
  const write = buildWrite(params)
  const decrypt = buildDecrypt(params)

  return {
    write,
    decrypt,
  }
}
