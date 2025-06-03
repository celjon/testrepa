import { DeliveryParams } from '@/delivery/types'
import { IHandler } from '../types'
import { buildCompletions, Completions } from './completions'
import { buildModels, Models } from './models'
import Express from 'express'
import { createRouteHandler } from '../../routeHandler'
import { buildOpenaiRules } from './rules'
import { Middlewares } from '../../middlewares'
import { buildImagesCreate, ImagesCreate } from './images.create'
import { buildModerationsCreate, ModerationsCreate } from './moderations.create'
import { buildTranscriptionsCreate, TranscriptionsCreate } from './transcriptions.create'
import { buildTranslationsCreate, TranslationsCreate } from './translations.create'
import { buildSpeechCreate, SpeechCreate } from './speech.create'
import { buildEmbeddings, Embeddings } from './embeddings'

type Params = Pick<DeliveryParams, 'openai' | 'middlewares'>

export type OpenaiMethods = {
  completions: Completions
  embeddings: Embeddings
  models: Models
  images: {
    create: ImagesCreate
  }
  moderations: {
    create: ModerationsCreate
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
}

const buildRegisterRoutes = (methods: OpenaiMethods, middlewares: Middlewares) => {
  const { completionRules } = buildOpenaiRules(middlewares)
  const { authRequired, fileUpload } = middlewares

  return (root: Express.Router) => {
    const namespace = Express.Router()

    namespace.post('/chat/completions', completionRules, createRouteHandler(methods.completions))
    namespace.post('/images/generations', authRequired(), createRouteHandler(methods.images.create))
    namespace.post(
      '/audio/transcriptions',
      authRequired(),
      fileUpload({ saveFiles: false }).any(),
      createRouteHandler(methods.transcriptions.create)
    )
    namespace.post('/audio/translations', authRequired(), createRouteHandler(methods.translations.create))
    namespace.post('/audio/speech', authRequired(), createRouteHandler(methods.speech.create)),
      namespace.post('/moderations', authRequired(), createRouteHandler(methods.moderations.create))
    namespace.post('/embeddings', authRequired(), createRouteHandler(methods.embeddings))
    namespace.get('/models', authRequired(), createRouteHandler(methods.models))

    root.use('/openai/v1', namespace)
  }
}

export const buildOpenaiHandler = (params: Params): IHandler => {
  return {
    registerRoutes: buildRegisterRoutes(
      {
        completions: buildCompletions(params),
        embeddings: buildEmbeddings(params),
        models: buildModels(params),
        images: {
          create: buildImagesCreate(params)
        },
        transcriptions: {
          create: buildTranscriptionsCreate(params)
        },
        translations: {
          create: buildTranslationsCreate(params)
        },
        speech: {
          create: buildSpeechCreate(params)
        },
        moderations: {
          create: buildModerationsCreate(params)
        }
      },
      params.middlewares
    )
  }
}
