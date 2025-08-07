import { AdapterParams } from '@/adapter/types'
import { buildGenerateVideo, GenerateVideo } from './generate-video'
import { buildGetVideoResult, GetVideoResult } from './get-video-result'

type Params = Pick<AdapterParams, 'ai302'>

export type ai302Gateway = {
  generateVideo: GenerateVideo
  getVideoResult: GetVideoResult
}

export const buildai302Gateway = (params: Params): ai302Gateway => {
  const generateVideo = buildGenerateVideo(params)
  const getVideoResult = buildGetVideoResult(params)

  return { generateVideo, getVideoResult }
}
