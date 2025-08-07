import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'youtube'>

export type GetTranscription = (params: { url: string }) => Promise<string>

export const buildGetTranscription =
  ({ youtube }: Params): GetTranscription =>
  async (params) => {
    const result = await youtube.client.getTranscription(params)

    return result
  }
