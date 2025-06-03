import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'redis'>

export type GetDecryptedFile = (params: { originalPath: string }) => Promise<{ path: string; ttlMs: number } | null>

export const buildGetDecryptedFile = ({ redis }: Params): GetDecryptedFile => {
  return async ({ originalPath }) => {
    const [path, ttlMs] = await Promise.all([
      redis.client.main.get(`decryptedFile:${originalPath}`),
      redis.client.main.pTTL(`decryptedFile:${originalPath}`)
    ])
    if (!path) {
      return null
    }

    return {
      path,
      ttlMs
    }
  }
}
