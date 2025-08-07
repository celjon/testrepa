import { Adapter } from '@/adapter'
import { AccountBalancerService, buildAccountBalancerService } from './account-balancer'
import { buildDisable, Disable } from './disable'
import { buildEnable, Enable } from './enable'
import { buildGetDefault, GetDefault } from './get-default'
import { buildGetDefaultProvider, GetDefaultProvider } from './get-default-provider'
import { buildGetModelProviders, GetModelProviders } from './get-model-providers'
import { buildIncrementUsage, IncrementUsage } from './increment-usage'
import { buildIsAllowed, IsAllowed } from './isAllowed'
import { buildParse, Parse } from './parse'
import { buildTokenize, Tokenize } from './tokenize'
import { buildGetCapsEmbeddings, GetCapsEmbeddings } from './get-caps/get-caps-embeddings'
import { buildGetCapsImage, GetCapsImage } from './get-caps/get-caps-image'
import { buildGetCapsSpeechToText, GetCapsSpeechToText } from './get-caps/get-caps-speech-to-text'
import { buildGetCapsTextToSpeech, GetCapsTextToSpeech } from './get-caps/get-caps-text-to-speech'
import { buildGetCapsText, GetCapsText } from './get-caps/get-caps-text'
import { buildGetCapsVideo, GetCapsVideo } from './get-caps/get-caps-video'
import { buildEstimateText, EstimateText } from './estimate/estimate-text'
import { buildEstimatePromptQueue, EstimatePromptQueue } from './estimate/estimate-prompt-queue'
import { buildEstimateEasyWriter, EstimateEasyWriter } from './estimate/estimate-easy-writer'
import { buildEstimateImage, EstimateImage } from './estimate/estimate-image'

type Params = Adapter

export type ModelService = {
  parse: Parse
  enable: Enable
  disable: Disable
  getDefault: GetDefault
  getDefaultProvider: GetDefaultProvider
  isAllowed: IsAllowed
  tokenize: Tokenize
  accountBalancer: AccountBalancerService
  getModelProviders: GetModelProviders
  incrementUsage: IncrementUsage

  getCaps: {
    embeddings: GetCapsEmbeddings
    image: GetCapsImage
    speechToText: GetCapsSpeechToText
    textToSpeech: GetCapsTextToSpeech
    text: GetCapsText
    video: GetCapsVideo
  }
  estimate: {
    image: EstimateImage
    easyWriter: EstimateEasyWriter
    promptQueue: EstimatePromptQueue
    text: EstimateText
  }
}

export const buildModelService = (params: Params): ModelService => {
  const parse = buildParse(params)
  const enable = buildEnable(params)
  const disable = buildDisable(params)
  const getDefault = buildGetDefault()
  const getDefaultProvider = buildGetDefaultProvider(params)
  const isAllowed = buildIsAllowed()
  const tokenize = buildTokenize()
  const accountBalancer = buildAccountBalancerService(params)
  const getModelProviders = buildGetModelProviders(params)

  //getCaps
  const embeddings = buildGetCapsEmbeddings({})
  const text = buildGetCapsText({})
  const image = buildGetCapsImage({})
  const speechToText = buildGetCapsSpeechToText({})
  const textToSpeech = buildGetCapsTextToSpeech({})
  const video = buildGetCapsVideo({})

  return {
    parse,
    enable,
    disable,
    getDefault,
    getDefaultProvider,
    isAllowed,
    tokenize,
    accountBalancer,
    getModelProviders,
    incrementUsage: buildIncrementUsage(params),

    getCaps: {
      embeddings,
      image,
      speechToText,
      textToSpeech,
      text,
      video,
    },

    estimate: {
      text: buildEstimateText({ getCapsText: text }),
      image: buildEstimateImage({ getCapsImage: image }),
      easyWriter: buildEstimateEasyWriter({ getCapsText: text }),
      promptQueue: buildEstimatePromptQueue({ getCapsText: text }),
    },
  }
}
