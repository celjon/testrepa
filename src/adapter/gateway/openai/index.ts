import { AdapterParams } from '@/adapter/types'
import {
  buildEmbeddingsCreate,
  buildImagesGenerate,
  buildModerationsCreate,
  buildSendRawStream,
  buildSendRawSync,
  buildSpeechCreate,
  buildTranscriptionsCreate,
  buildTranslationsCreate,
  EmbeddingsCreate,
  ImagesGenerate,
  ModerationsCreate,
  SendRawStream,
  SendRawSync,
  SpeechCreate,
  TranscriptionsCreate,
  TranslationsCreate
} from './raw'
import { buildGetModels, GetModels } from './getModels'

type Params = Pick<AdapterParams, 'openaiBalancer' | 'openRouterBalancer' | 'openaiTranscriptionBalancer'>

export type OpenaiGateway = {
  getModels: GetModels
  raw: {
    completions: {
      create: {
        stream: SendRawStream
        sync: SendRawSync
      }
    }
    images: {
      create: ImagesGenerate
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
  }
}

export const buildOpenaiGateway = (params: Params): OpenaiGateway => {
  const getModels = buildGetModels(params)

  return {
    getModels,
    raw: {
      completions: {
        create: {
          sync: buildSendRawSync(params),
          stream: buildSendRawStream(params)
        }
      },
      translations: {
        create: buildTranslationsCreate(params)
      },
      images: {
        create: buildImagesGenerate(params)
      },
      transcriptions: {
        create: buildTranscriptionsCreate(params)
      },
      speech: {
        create: buildSpeechCreate(params)
      },
      moderations: {
        create: buildModerationsCreate(params)
      },
      embeddings: {
        create: buildEmbeddingsCreate(params)
      }
    }
  }
}
