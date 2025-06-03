import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'g4f'>

export type WriteHarFile = (params: { name: string; buffer: Buffer; apiUrl: string; harManagerUrl: string }) => Promise<unknown>

export const buildWriteHarFile = ({ g4f }: Params): WriteHarFile => {
  return async ({ name, buffer, apiUrl, harManagerUrl }) => {
    const g4fClient = g4f.client.create({
      apiUrl,
      harManagerUrl
    })

    await g4fClient.writeHARFile({
      name,
      buffer,
      apiUrl
    })
  }
}
