import { AdapterParams } from '@/adapter/types'
import { buildWrite, Write } from './write'
import { buildRead, Read } from './read'
import { buildGetTemporaryPath, GetTemporaryPath } from './getTemporaryPath'
import { buildWriteTemporary, WriteTemporary } from './writeTemporaryFile'

type Params = Pick<AdapterParams, 'minio'>

export type StorageGateway = {
  write: Write
  read: Read
  writeTemporary: WriteTemporary
  getTemporaryPath: GetTemporaryPath
}
export const buildStorageGateway = (params: Params): StorageGateway => {
  const write = buildWrite(params)
  const read = buildRead()
  const writeTemporary = buildWriteTemporary(params)
  const getTemporaryPath = buildGetTemporaryPath(params)

  return {
    write,
    read,
    writeTemporary,
    getTemporaryPath
  }
}
