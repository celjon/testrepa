import { Adapter } from '@/domain/types'
import { buildMidjourneyService, MidjourneyService } from './midjourney'
import { ModelService } from '../../model'
import { buildTextService, TextService } from './text'
import { buildImageService, ImageService } from './image'
import { buildReplicateImageService, ReplicateImageService } from './replicate-image'
import { buildTextToSpeechService, TextToSpeechService } from './text-to-speech'
import { buildUpsert, Upsert } from './upsert'
import {
  buildSpeechToTextService,
  SpeechToTextService,
} from '@/domain/service/chat/settings/speech-to-text'
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
  textToSpeech: TextToSpeechService
  speechToText: SpeechToTextService
  video: VideoService
}

export const buildSettingsService = (params: Params): SettingsService => {
  const text = buildTextService(params)
  const image = buildImageService(params)
  const midjourney = buildMidjourneyService()
  const replicateImage = buildReplicateImageService(params)
  const textToSpeech = buildTextToSpeechService(params)
  const speechToText = buildSpeechToTextService(params)
  const video = buildVideoService(params)
  const upsert = buildUpsert({
    ...params,
    textService: text,
    imageService: image,
    midjourneyService: midjourney,
    replicateImageService: replicateImage,
    textToSpeechService: textToSpeech,
    speechToTextService: speechToText,
    videoService: video,
  })

  return {
    text,
    image,
    speechToText,
    midjourney,
    replicateImage,
    textToSpeech,
    video,
    upsert,
  }
}
