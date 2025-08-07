import { MINIO_STORAGE } from '@/adapter/consts'
import { AdapterParams } from '@/adapter/types'
import { runWithConcurrencyLimit } from '@/lib'

type Params = Pick<AdapterParams, 'minio'>
export type DeleteFiles = (paths: string[]) => Promise<number>

export const buildDeleteFiles = ({ minio }: Params): DeleteFiles => {
  return async (paths) => {
    const bucketName = MINIO_STORAGE
    let deletedCount = 0

    if (paths.length === 0) {
      return 0
    }

    async function deleteFiles(path: string) {
      return minio.client.removeObject(bucketName, path, { forceDelete: true }).then(() => {
        deletedCount++
      })
    }
    await runWithConcurrencyLimit(4, paths, deleteFiles)

    return deletedCount
  }
}
