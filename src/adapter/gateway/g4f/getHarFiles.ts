import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'g4f'>

export type GetHarFiles = (params: { apiUrl: string; harManagerUrl: string }) => Promise<string[]>

export const buildGetHarFiles = ({ g4f }: Params): GetHarFiles => {
  return async ({ apiUrl, harManagerUrl }) => {
    const g4fClient = g4f.client.create({
      apiUrl,
      harManagerUrl
    })

    const harFiles = await g4fClient.getHARFiles()

    return harFiles
  }
}
