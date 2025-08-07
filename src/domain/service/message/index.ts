import { ChatService } from '../chat'
import { Adapter } from '@/domain/types'
import { buildSendImage, SendImage } from './image/send'
import { buildSendMidjourney, SendMidjourney } from './midjourney/send'
import { buildPaginate, Paginate } from './paginate'
import { buildSendTelegram, SendTelegram } from './telegram/send'
import { buildSendText, SendText } from './text/send'
import { JobService } from '../job'
import { buildMidjourneyButtonClick, MidjourneyButtonClick } from './midjourney/button-click'
import { SubscriptionService } from '../subscription'
import { UserService } from '../user'
import { buildGeneratePrompt, GeneratePrompt } from './generate-prompt'
import { ModerationService } from '../moderation'
import { MidjourneyService } from '../midjourney'
import { ModelService } from '../model'
import { buildSendTextByProvider, SendTextByProvider } from './text/send-by-provider'
import { buildSendImageByProvider, SendImageByProvider } from './image/send-by-provider'
import {
  buildSendReplicateImage,
  SendReplicateImage,
} from '@/domain/service/message/replicate-image/send'
import {
  buildSendReplicateImageByProvider,
  SendReplicateImageByProvider,
} from '@/domain/service/message/replicate-image/send-by-provider'
import { buildSendSpeech, SendSpeech } from './speech/send'
import { buildPerformWebSearch } from './plugins/web-search/perform-web-search'
import { buildPerformURLAnalysis } from './perform-url-analysis'
import { buildUploadFiles, UploadFiles } from './upload/files'
import { buildUploadVoice, UploadVoice } from './upload/voice'
import { buildRegenerateText, RegenerateText } from './text/regenerate'
import {
  buildRegenerateReplicateImage,
  RegenerateReplicateImage,
} from '@/domain/service/message/replicate-image/regenerate'
import { buildRegenerateImage, RegenerateImage } from './image/regenerate'
import { buildDefineButtonsAndImages } from './midjourney/define-buttons'
import { buildCallback } from './midjourney/callback'
import { buildGet, Get } from './storage/get'
import { buildList, List } from './storage/list'
import { buildUpdate, Update } from './storage/update'
import { buildUpdateMany, UpdateMany } from './storage/update-many'
import { buildCreate, Create } from './storage/create'
import { buildDecryptMessage } from './storage/decrypt/decrypt-message'
import { FileService } from '../file'
import { buildTranslatePrompt, TransalatePrompt } from './translate-prompt'
import { buildUploadVideo, UploadVideo } from '@/domain/service/message/upload/video'
import { buildGeneralSystemPromptPlugin } from './plugins/general-system-prompt'
import { buildProcessMj, ProcessMj } from './midjourney/process-mj'
import { buildDefineError, DefineError } from './midjourney/define-error'
import { buildConstantCostPlugin } from './plugins/constant-cost'
import { buildSendSpeech2Text, SendSpeech2Text } from '@/domain/service/message/speech2text/send'
import { Speech2TextService } from '../speech2text'
import { AIToolsService } from '../ai-tools'
import { buildSendVideo, SendVideo } from './video/send'
import { buildSendVideoByProvider, SendVideoByProvider } from './video/send-by-provider'
import { buildEventStreamService, EventStreamService } from './event-stream'

type Params = Adapter & {
  chatService: ChatService
  jobService: JobService
  subscriptionService: SubscriptionService
  userService: UserService
  moderationService: ModerationService
  midjourneyService: MidjourneyService
  modelService: ModelService
  fileService: FileService
  speech2TextService: Speech2TextService
  aiToolsService: AIToolsService
}

export type MessageService = {
  text: {
    send: SendText
    regenerate: RegenerateText
    sendByProvider: SendTextByProvider
  }
  midjourney: {
    send: SendMidjourney
    buttonClick: MidjourneyButtonClick
    processMj: ProcessMj
    defineError: DefineError
  }
  replicateImage: {
    send: SendReplicateImage
    regenerate: RegenerateReplicateImage
    sendByProvider: SendReplicateImageByProvider
  }
  video: {
    send: SendVideo
    sendByProvider: SendVideoByProvider
  }
  image: {
    send: SendImage
    regenerate: RegenerateImage
    sendByProvider: SendImageByProvider
  }
  speech: {
    send: SendSpeech
  }
  speech2text: {
    send: SendSpeech2Text
  }
  telegram: {
    send: SendTelegram
  }
  upload: {
    files: UploadFiles
    voice: UploadVoice
    video: UploadVideo
  }
  storage: {
    create: Create
    get: Get
    list: List
    update: Update
    updateMany: UpdateMany
  }
  paginate: Paginate
  generatePrompt: GeneratePrompt
  translatePrompt: TransalatePrompt
  eventStream: EventStreamService
}

export const buildMessageService = (params: Params): MessageService => {
  const decryptMessage = buildDecryptMessage(params)
  const create = buildCreate({ ...params, decryptMessage })
  const get = buildGet({ ...params, decryptMessage })
  const list = buildList({ ...params, decryptMessage })
  const update = buildUpdate({ ...params, get, decryptMessage })
  const updateMany = buildUpdateMany(params)
  const translatePrompt = buildTranslatePrompt(params)

  const storage = {
    create,
    get,
    list,
    update,
    updateMany,
  }

  const uploadFiles = buildUploadFiles(params)
  const uploadVoice = buildUploadVoice(params)
  const uploadVideo = buildUploadVideo(params)

  const constantCostPlugin = buildConstantCostPlugin(params)
  const performWebSearchPlugin = buildPerformWebSearch({
    ...params,
    messageStorage: storage,
  })
  const generalSystemPromptPlugin = buildGeneralSystemPromptPlugin()
  const performURLAnalysis = buildPerformURLAnalysis(params)
  const generatePrompt = buildGeneratePrompt({
    ...params,
    performURLAnalysis,
  })

  const sendTextByProvider = buildSendTextByProvider(params)
  const sendText = buildSendText({
    ...params,
    sendTextByProvider,
    generatePrompt,
    uploadFiles,
    uploadVoice,
    uploadVideo,
    constantCostPlugin,
    performWebSearchPlugin,
    generalSystemPromptPlugin,
    messageStorage: storage,
  })
  const regenerateText = buildRegenerateText({
    ...params,
    constantCostPlugin,
    sendTextByProvider,
    messageStorage: storage,
  })

  const sendImageByProvider = buildSendImageByProvider(params)
  const sendImage = buildSendImage({
    ...params,
    sendImageByProvider,
    uploadFiles,
    uploadVoice,
    messageStorage: storage,
  })
  const regenerateImage = buildRegenerateImage({
    ...params,
    sendImageByProvider,
    messageStorage: storage,
  })

  const defineButtonsAndImages = buildDefineButtonsAndImages(params)
  const callback = buildCallback(params)
  const defineError = buildDefineError()
  const processMj = buildProcessMj({ ...params, defineError })
  const sendMidjourney = buildSendMidjourney({
    ...params,
    defineButtonsAndImages,
    callback,
    uploadFiles,
    uploadVoice,
    translatePrompt,
    messageStorage: storage,
    processMj: processMj,
  })
  const clickMidjourneyButton = buildMidjourneyButtonClick({
    ...{
      ...params,
      defineButtonsAndImages,
      callback,
      processMj: processMj,
    },
    messageStorage: storage,
  })
  const sendVideoByProvider = buildSendVideoByProvider(params)
  const sendVideo = buildSendVideo({
    ...params,
    uploadFiles,
    uploadVoice,
    translatePrompt,
    sendVideoByProvider,
    messageStorage: storage,
  })

  const sendReplicateImageByProvider = buildSendReplicateImageByProvider(params)
  const sendReplicateImage = buildSendReplicateImage({
    ...params,
    sendImageByProvider: sendReplicateImageByProvider,
    uploadFiles,
    uploadVoice,
    translatePrompt,
    messageStorage: storage,
  })
  const regenerateReplicateImage = buildRegenerateReplicateImage({
    ...params,
    sendImageByProvider: sendReplicateImageByProvider,
    translatePrompt,
    messageStorage: storage,
  })

  const paginate = buildPaginate({
    ...params,
    messageStorage: storage,
  })
  const sendTelegram = buildSendTelegram(params)
  const speechSend = buildSendSpeech({
    ...params,
    messageStorage: storage,
  })
  const sendSpeech2Text = buildSendSpeech2Text({
    ...params,
    messageStorage: storage,
    constantCostPlugin,
  })
  const eventStream = buildEventStreamService(params)
  return {
    paginate,
    generatePrompt,
    translatePrompt,
    speech2text: {
      send: sendSpeech2Text,
    },

    text: {
      send: sendText,
      regenerate: regenerateText,
      sendByProvider: sendTextByProvider,
    },
    midjourney: {
      send: sendMidjourney,
      buttonClick: clickMidjourneyButton,
      processMj: processMj,
      defineError,
    },
    replicateImage: {
      send: sendReplicateImage,
      regenerate: regenerateReplicateImage,
      sendByProvider: sendReplicateImageByProvider,
    },
    video: {
      send: sendVideo,
      sendByProvider: sendVideoByProvider,
    },
    speech: {
      send: speechSend,
    },
    image: {
      send: sendImage,
      regenerate: regenerateImage,
      sendByProvider: sendImageByProvider,
    },
    telegram: {
      send: sendTelegram,
    },
    upload: {
      files: uploadFiles,
      voice: uploadVoice,
      video: uploadVideo,
    },
    storage,
    eventStream,
  }
}
