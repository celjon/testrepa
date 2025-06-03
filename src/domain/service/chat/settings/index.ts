import { Adapter } from '@/domain/types'
import { buildMidjourneyService, MidjourneyService } from './midjourney'
import { ModelService } from '../../model'
import { buildTextService, TextService } from './text'
import { buildImageService, ImageService } from './image'
import { buildReplicateImageService, ReplicateImageService } from './replicateImage'
import { buildSpeechService, SpeechService } from './speech'
import { buildUpsert, Upsert } from './upsert'
import { buildSpeech2TextService, Speech2TextService } from '@/domain/service/chat/settings/speech2text'
import { buildVideoService, VideoService } from './video'

export type Params = Adapter & {
  modelService: ModelService
}

export type SettingsService = {
  text: TextService
  image: ImageService
  midjourney: MidjourneyService
  replicateImage: ReplicateImageService
  upsert: Upsert
  speech: SpeechService
  speech2text: Speech2TextService
  video: VideoService
}

export const buildSettingsService = (params: Params): SettingsService => {
  const text = buildTextService(params)
  const image = buildImageService(params)
  const midjourney = buildMidjourneyService()
  const replicateImage = buildReplicateImageService(params)
  const speech = buildSpeechService(params)
  const speech2text = buildSpeech2TextService(params)
  const video = buildVideoService(params)
  const upsert = buildUpsert({
    ...params,
    textService: text,
    imageService: image,
    midjourneyService: midjourney,
    replicateImageService: replicateImage,
    speechService: speech,
    videoService: video
  })

  return {
    text,
    image,
    speech2text,
    midjourney,
    replicateImage,
    speech,
    video,
    upsert
  }
}
