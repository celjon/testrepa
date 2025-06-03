import { buildDalleGateway, DalleGateway } from './dall-e'
import { buildDocumentGateway, DocumentGateway } from './document'
import { buildGptGateway, GptGateway } from './gpt'
import { buildImageGateway, ImageGateway } from './image'
import { buildMailGateway, MailGateway } from './mail'
import { buildMidjourneyGateway, MidjourneyGateway } from './midjourney'
import { buildOpenaiGateway, OpenaiGateway } from './openai'
import { buildOpenrouterGateway, OpenrouterGateway } from './openrouter'
import { buildPaymentGateway, PaymentGateway } from './payment'
import { buildStorageGateway, StorageGateway } from './storage'
import { buildTelegramGateway, TelegramGateway } from './telegram'
import { buildMediaGateway, MediaGateway } from './audio'
import { buildSpeechGateway, SpeechGateway } from './speech'
import { buildG4FGateway, G4FGateway } from './g4f'
import { buildYoutubeDataGateway, YoutubeDataGateway } from './youtube-data-api'
import { buildGeoGateway, GeoGateway } from './geo'
import { buildWebSearchGateway, WebSearchGateway } from './webSearch'
import { buildReplicateGateway, ReplicateGateway } from './replicate'
import { buildTgNotificationBotGateway, TgNotificationBotGateway } from './tg-notification-bot'
import { buildModerationGateway, ModerationGateway } from './moderation'
import { buildCryptoGateway, CryptoGateway } from './crypto'
import { buildYandexMetricGateway, YandexMetricGateway } from './yandex-metric'

import { AdapterParams } from '../types'
import { buildClusterGateway, ClusterGateway } from './cluster'
import { buildHealthCheckGateway, HealthCheckGateway } from './health-check'
import { AssemblyAiGateway, buildAssemblyAiGateway } from './assemblyAi'
import { buildCurrencyToRubRateGateway, CurrencyToRubRateGateway } from '@/adapter/gateway/currency-rate'
import { buildExcelGateway, ExcelGateway } from '@/adapter/gateway/excel'
import { buildGoogleScholarGateway, GoogleScholarGateway } from '@/adapter/gateway/google-scholar'
import { buildDataAnalysisGateway, DataAnalysisGateway } from './data-analysis'
import { buildRunwayGateway, RunwayGateway } from './runway'

export type Gateway = {
  paymentGateway: PaymentGateway
  mailGateway: MailGateway
  telegramGateway: TelegramGateway
  gptGateway: GptGateway
  midjourneyGateway: MidjourneyGateway
  dalleGateway: DalleGateway
  speechGateway: SpeechGateway
  storageGateway: StorageGateway
  openaiGateway: OpenaiGateway
  imageGateway: ImageGateway
  openrouterGateway: OpenrouterGateway
  documentGateway: DocumentGateway
  tgNotificationBotGateway: TgNotificationBotGateway
  mediaGateway: MediaGateway
  g4fGateway: G4FGateway
  youtubeDataGateway: YoutubeDataGateway
  geoGateway: GeoGateway
  webSearchGateway: WebSearchGateway
  replicateGateway: ReplicateGateway
  moderationGateway: ModerationGateway
  cryptoGateway: CryptoGateway
  clusterGateway: ClusterGateway
  healthCheckGateway: HealthCheckGateway
  assemblyAiGateway: AssemblyAiGateway
  yandexMetricGateway: YandexMetricGateway
  currencyToRubRateGateway: CurrencyToRubRateGateway
  excelGateway: ExcelGateway
  googleScholarGateway: GoogleScholarGateway
  dataAnalysisGateway: DataAnalysisGateway
  runwayGateway: RunwayGateway
}

export const buildGateway = (params: AdapterParams): Gateway => {
  const paymentGateway = buildPaymentGateway(params)
  const mailGateway = buildMailGateway(params)
  const telegramGateway = buildTelegramGateway(params)
  const midjourneyGateway = buildMidjourneyGateway(params)
  const storageGateway = buildStorageGateway(params)
  const gptGateway = buildGptGateway({
    ...params,
    storageGateway
  })
  const dalleGateway = buildDalleGateway({ ...params, storageGateway })
  const speechGateway = buildSpeechGateway(params)
  const openaiGateway = buildOpenaiGateway(params)
  const imageGateway = buildImageGateway()
  const openrouterGateway = buildOpenrouterGateway({
    ...params,
    storageGateway
  })
  const documentGateway = buildDocumentGateway()
  const tgNotificationBotGateway = buildTgNotificationBotGateway(params)
  const mediaGateway = buildMediaGateway()
  const g4fGateway = buildG4FGateway(params)
  const geoGateway = buildGeoGateway()
  const webSearchGateway = buildWebSearchGateway(params)
  const youtubeDataGateway = buildYoutubeDataGateway(params)
  const replicateGateway = buildReplicateGateway(params)
  const moderationGateway = buildModerationGateway({
    ...params,
    storageGateway
  })
  const cryptoGateway = buildCryptoGateway()
  const clusterGateway = buildClusterGateway()
  const healthCheckGateway = buildHealthCheckGateway({
    ...params,
    clusterGateway
  })
  const assemblyAiGateway = buildAssemblyAiGateway(params)
  const yandexMetricGateway = buildYandexMetricGateway(params)
  const currencyToRubRateGateway = buildCurrencyToRubRateGateway(params)
  const excelGateway = buildExcelGateway()
  const googleScholarGateway = buildGoogleScholarGateway(params)
  const dataAnalysisGateway = buildDataAnalysisGateway(params)
  const runwayGateway = buildRunwayGateway(params)

  return {
    paymentGateway,
    mailGateway,
    telegramGateway,
    midjourneyGateway,
    gptGateway,
    dalleGateway,
    speechGateway,
    storageGateway,
    openaiGateway,
    imageGateway,
    openrouterGateway,
    documentGateway,
    tgNotificationBotGateway,
    mediaGateway,
    g4fGateway,
    geoGateway,
    webSearchGateway,
    replicateGateway,
    youtubeDataGateway,
    moderationGateway,
    cryptoGateway,
    clusterGateway,
    healthCheckGateway,
    assemblyAiGateway,
    yandexMetricGateway,
    currencyToRubRateGateway,
    excelGateway,
    googleScholarGateway,
    dataAnalysisGateway,
    runwayGateway
  }
}

export { DalleGateway } from './dall-e'
export { DocumentGateway } from './document'
export { GptGateway } from './gpt'
export { ImageGateway } from './image'
export { MailGateway } from './mail'
export { MidjourneyGateway } from './midjourney'
export { OpenaiGateway } from './openai'
export { OpenrouterGateway } from './openrouter'
export { PaymentGateway } from './payment'
export { StorageGateway } from './storage'
export { TelegramGateway } from './telegram'
export { MediaGateway } from './audio'
export { SpeechGateway } from './speech'
export { G4FGateway } from './g4f'
export { YoutubeDataGateway } from './youtube-data-api'
export { GeoGateway } from './geo'
export { WebSearchGateway } from './webSearch'
export { AssemblyAiGateway } from './assemblyAi'
export { ReplicateGateway } from './replicate'
export { TgNotificationBotGateway } from './tg-notification-bot'
export { ModerationGateway } from './moderation'
export { RunwayGateway } from './runway'
