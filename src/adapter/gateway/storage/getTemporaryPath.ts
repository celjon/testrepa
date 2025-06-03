import { MINIO_STORAGE } from '@/adapter/consts'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'minio'>

export type GetTemporaryPath = (params: { path: string; ttlMs: number }) => Promise<string>

export const buildGetTemporaryPath = ({ minio }: Params): GetTemporaryPath => {
  return async ({ path, ttlMs }) => {
    const url = await minio.client.presignedGetObject(MINIO_STORAGE, path, Math.ceil(ttlMs / 1000))

    const urlObj = new URL(url)

    const rest = urlObj.href.replace(urlObj.origin, '')

    return rest.replace(`/${MINIO_STORAGE}/`, '')
  }
}
