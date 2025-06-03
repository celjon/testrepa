import { AdapterParams } from '@/adapter/types'
import { buildGetTranscription } from './getTranscription'

type Params = Pick<AdapterParams, 'youtube'>

export type YoutubeDataGateway = {
  getTranscription: (params: { url: string }) => Promise<string>
}

export const buildYoutubeDataGateway = (params: Params): YoutubeDataGateway => {
  const getTranscription = buildGetTranscription(params)

  return {
    getTranscription
  }
}
