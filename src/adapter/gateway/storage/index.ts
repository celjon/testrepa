import { AdapterParams } from '@/adapter/types'
import { buildWrite, Write } from './write'
import { buildRead, Read } from './read'
import { buildGetTemporaryPath, GetTemporaryPath } from './get-temporary-path'
import { buildWriteTemporary, WriteTemporary } from './write-temporary-file'
import { buildGeneratePresignedUrl, GeneratePresignedUrl } from './generatePresignedUrl'
import { buildDeleteFiles, DeleteFiles } from './delete-files'

type Params = Pick<AdapterParams, 'minio'>

export type StorageGateway = {
  write: Write
  read: Read
  writeTemporary: WriteTemporary
  getTemporaryPath: GetTemporaryPath
  generatePresignedUrl: GeneratePresignedUrl
  deleteFiles: DeleteFiles
}
export const buildStorageGateway = (params: Params): StorageGateway => {
  const write = buildWrite(params)
  const read = buildRead()
  const writeTemporary = buildWriteTemporary(params)
  const getTemporaryPath = buildGetTemporaryPath(params)
  const generatePresignedUrl = buildGeneratePresignedUrl(params)
  const deleteFiles = buildDeleteFiles(params)
  return {
    write,
    read,
    writeTemporary,
    getTemporaryPath,
    generatePresignedUrl,
    deleteFiles,
  }
}
