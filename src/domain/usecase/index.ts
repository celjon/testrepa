import { AuthUseCase, buildAuthUseCase } from './auth'
import { buildChatUseCase, ChatUseCase } from './chat'
import { buildGroupUseCase, GroupUseCase } from './group'
import { buildMessageUseCase, MessageUseCase } from './message'
import { buildUserUseCase, UserUseCase } from './user'
import { buildPresetUseCase, PresetUseCase } from './preset'
import { buildPlanUseCase, PlanUseCase } from './plan'
import { UseCaseParams } from './types'
import { buildWebhookUseCase, WebhookUseCase } from './webhook'
import { buildModelUseCase, ModelUseCase } from './model'
import { buildSubscriptionUseCase, SubscriptionUseCase } from './subscription'
import { buildTransactionUseCase, TransactionUseCase } from './transaction'
import { buildDeveloperUseCase, DeveloperUseCase } from './developer'
import { buildShortcutUseCase, ShortcutUseCase } from './shortcut'
import { buildEnterpriseUseCase, EnterpriseUseCase } from './enterprise'
import { buildReferralTemplateUseCase, ReferralTemplateUseCase } from './referral-template'
import { buildReferralUseCase, ReferralUseCase } from './referral'
import { buildOpenaiUseCase, OpenaiUseCase } from './openai'
import { buildStatisticsUseCase, StatisticsUseCase } from './statistics'
import { buildJobUseCase, JobUseCase } from './job'
import { buildMidjourneyUseCase, MidjourneyUseCase } from './midjourney'
import { buildArticleUseCase, ArticleUseCase } from './article'
import { buildGeoUseCase, GeoUseCase } from './geo'
import { buildFileUseCase, FileUseCase } from './file'
import { buildDataAnalysisUseCase, DataAnalysisUseCase } from './data-analysis'
import { buildSEOArticleCategoryUseCase, SEOArticleCategoryUseCase } from './seo-article-category'
import { buildSEOArticleTopicUseCase, SEOArticleTopicUseCase } from './seo-article-topic'
import {
  buildSEOArticleProofreadingUseCase,
  SEOArticleProofreadingUseCase,
} from './seo-article-proofreading'
import { buildSEOArticleExpertUseCase, SEOArticleExpertUseCase } from './seo-article-expert'
import {
  buildSEOArticleExpertJobHistoryUseCase,
  SEOArticleExpertJobHistoryUseCase,
} from './seo-article-expert-job-history'
import { buildAIToolsUseCase, AIToolsUseCase } from './ai-tools'
import { buildIntentUseCase, IntentUseCase } from './intent'
import { buildGiftCertificateUseCase, GiftCertificateUseCase } from './gift-certificate'
import { buildExchangeRateUseCase, ExchangeRateUseCase } from './exchange-rate'

export type UseCase = {
  auth: AuthUseCase
  chat: ChatUseCase
  job: JobUseCase
  group: GroupUseCase
  message: MessageUseCase
  user: UserUseCase
  preset: PresetUseCase
  plan: PlanUseCase
  webhook: WebhookUseCase
  model: ModelUseCase
  subscription: SubscriptionUseCase
  transaction: TransactionUseCase
  developer: DeveloperUseCase
  shortcut: ShortcutUseCase
  enterprise: EnterpriseUseCase
  referralTemplate: ReferralTemplateUseCase
  referral: ReferralUseCase
  openai: OpenaiUseCase
  statistics: StatisticsUseCase
  midjourney: MidjourneyUseCase
  article: ArticleUseCase
  seoArticleCategory: SEOArticleCategoryUseCase
  seoArticleTopic: SEOArticleTopicUseCase
  seoArticleProofreading: SEOArticleProofreadingUseCase
  seoArticleExpert: SEOArticleExpertUseCase
  seoArticleExpertJobHistory: SEOArticleExpertJobHistoryUseCase
  geo: GeoUseCase
  file: FileUseCase
  dataAnalysis: DataAnalysisUseCase
  aiTools: AIToolsUseCase
  intent: IntentUseCase
  giftCertificate: GiftCertificateUseCase
  exchangeRate: ExchangeRateUseCase
}

export const buildUseCase = (params: UseCaseParams): UseCase => {
  const auth = buildAuthUseCase(params)
  const chat = buildChatUseCase(params)
  const job = buildJobUseCase(params)
  const group = buildGroupUseCase(params)
  const message = buildMessageUseCase(params)
  const user = buildUserUseCase(params)
  const preset = buildPresetUseCase(params)
  const plan = buildPlanUseCase(params)
  const webhook = buildWebhookUseCase(params)
  const model = buildModelUseCase(params)
  const subscription = buildSubscriptionUseCase(params)
  const transaction = buildTransactionUseCase(params)
  const developer = buildDeveloperUseCase(params)
  const shortcut = buildShortcutUseCase(params)
  const enterprise = buildEnterpriseUseCase(params)
  const referralTemplate = buildReferralTemplateUseCase(params)
  const referral = buildReferralUseCase(params)
  const openai = buildOpenaiUseCase(params)
  const statistics = buildStatisticsUseCase(params)
  const midjourney = buildMidjourneyUseCase(params)
  const article = buildArticleUseCase(params)
  const seoArticleCategory = buildSEOArticleCategoryUseCase(params)
  const seoArticleTopic = buildSEOArticleTopicUseCase(params)
  const seoArticleExpert = buildSEOArticleExpertUseCase(params)
  const seoArticleExpertJobHistory = buildSEOArticleExpertJobHistoryUseCase(params)
  const seoArticleProofreading = buildSEOArticleProofreadingUseCase(params)
  const geo = buildGeoUseCase(params)
  const file = buildFileUseCase(params)
  const dataAnalysis = buildDataAnalysisUseCase(params)
  const intent = buildIntentUseCase(params)
  const giftCertificate = buildGiftCertificateUseCase(params)
  const exchangeRate = buildExchangeRateUseCase(params)

  return {
    auth,
    chat,
    job,
    group,
    message,
    user,
    preset,
    plan,
    webhook,
    model,
    subscription,
    transaction,
    developer,
    shortcut,
    enterprise,
    referralTemplate,
    referral,
    openai,
    statistics,
    midjourney,
    article,
    seoArticleCategory,
    seoArticleExpert,
    seoArticleTopic,
    seoArticleExpertJobHistory,
    seoArticleProofreading,
    geo,
    file,
    dataAnalysis,
    intent,
    giftCertificate,
    exchangeRate,
    aiTools: buildAIToolsUseCase(params),
  }
}
