import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'redis'>

export type CreateDecryptedFile = (params: {
  originalPath: string
  decryptedPath: string
  ttlMs: number
}) => Promise<string>

export const buildCreateDecryptedFile = ({ redis }: Params): CreateDecryptedFile => {
  return async ({ originalPath, decryptedPath, ttlMs }) => {
    await redis.client.main.set(`decryptedFile:${originalPath}`, decryptedPath, {
      PX: ttlMs,
    })

    return decryptedPath
  }
}
