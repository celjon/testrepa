import { UseCaseParams } from '@/domain/usecase/types'
import { buildCompletionsSync, CompletionsSync } from './completions.sync'
import { buildCompletionsStream, CompletionsStream } from './completions.stream'
import { buildModels, Models } from './models'
import { buildImagesCreate, ImagesCreate } from './images.create'
import { buildTranscriptionsCreate, TranscriptionsCreate } from './transcriptions.create'
import { buildModerationsCreate, ModerationsCreate } from './moderations.create'
import { buildTranslationsCreate, TranslationsCreate } from './translations.create'
import { buildSpeechCreate, SpeechCreate } from './speech.create'
import { buildEmbeddingsCreate, EmbeddingsCreate } from './embeddings.create'

export type OpenaiUseCase = {
  completions: {
    sync: CompletionsSync
    stream: CompletionsStream
  }
  images: {
    create: ImagesCreate
  }
  transcriptions: {
    create: TranscriptionsCreate
  }
  translations: {
    create: TranslationsCreate
  }
  speech: {
    create: SpeechCreate
  }
  moderations: {
    create: ModerationsCreate
  }
  embeddings: {
    create: EmbeddingsCreate
  }
  models: Models
}
export const buildOpenaiUseCase = (params: UseCaseParams): OpenaiUseCase => {
  return {
    translations: {
      create: buildTranslationsCreate(params),
    },
    completions: {
      sync: buildCompletionsSync(params),
      stream: buildCompletionsStream(params),
    },
    images: {
      create: buildImagesCreate(params),
    },
    moderations: {
      create: buildModerationsCreate(params),
    },
    speech: {
      create: buildSpeechCreate(params),
    },
    transcriptions: {
      create: buildTranscriptionsCreate(params),
    },
    embeddings: {
      create: buildEmbeddingsCreate(params),
    },
    models: buildModels(params),
  }
}
