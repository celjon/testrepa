import { Adapter } from '@/domain/types'

export type Write = (params: { buffer: Buffer; ext: string; dek: Buffer | null }) => Promise<{
  id: string
  name: string
  path: string
  url: string
  buffer: Buffer
  isEncrypted: boolean
}>

export const buildWrite = ({ storageGateway, cryptoGateway }: Adapter): Write => {
  return async ({ buffer, ext, dek }) => {
    let bufferToStore = buffer
    let isEncrypted = false
    if (dek) {
      bufferToStore = await cryptoGateway.encryptBytes({
        data: buffer,
        dek
      })
      isEncrypted = true
    }

    const written = await storageGateway.write({
      buffer: bufferToStore,
      ext
    })

    return {
      ...written,
      isEncrypted
    }
  }
}
