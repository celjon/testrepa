import { AuthUseCase, buildAuthUseCase } from '@/domain/usecase/auth'
import { buildChatUseCase, ChatUseCase } from '@/domain/usecase/chat'
import { buildGroupUseCase, GroupUseCase } from '@/domain/usecase/group'
import { buildMessageUseCase, MessageUseCase } from '@/domain/usecase/message'
import { buildUserUseCase, UserUseCase } from '@/domain/usecase/user'
import { buildPresetUseCase, PresetUseCase } from '@/domain/usecase/preset'
import { buildPlanUseCase, PlanUseCase } from '@/domain/usecase/plan'
import { UseCaseParams } from '@/domain/usecase/types'
import { buildWebhookUseCase, WebhookUseCase } from '@/domain/usecase/webhook'
import { buildModelUseCase, ModelUseCase } from '@/domain/usecase/model'
import { buildSubscriptionUseCase, SubscriptionUseCase } from '@/domain/usecase/subscription'
import { buildTransactionUseCase, TransactionUseCase } from '@/domain/usecase/transaction'
import { buildDeveloperUseCase, DeveloperUseCase } from './developer'
import { buildShortcutUseCase, ShortcutUseCase } from './shortcut'
import { buildEnterpriseUseCase, EnterpriseUseCase } from '@/domain/usecase/enterprise'
import { buildReferralTemplateUseCase, ReferralTemplateUseCase } from './referralTemplate'
import { buildReferralUseCase, ReferralUseCase } from './referral'
import { buildOpenaiUseCase, OpenaiUseCase } from './openai'
import { buildStatisticsUseCase, StatisticsUseCase } from './statistics'
import { buildJobUseCase, JobUseCase } from './job'
import { buildMidjourneyUseCase, MidjourneyUseCase } from './midjourney'
import { ArticleUseCase, buildArticleUseCase } from './article'
import { buildGeoUseCase, GeoUseCase } from './geo'
import { buildFileUseCase, FileUseCase } from './file'
import { buildDataAnalysisUseCase, DataAnalysisUseCase } from './data-analysis'
import { buildSEOArticleCategoryUseCase, SEOArticleCategoryUseCase } from '@/domain/usecase/seo-article-category'
import { buildSEOArticleTopicUseCase, SEOArticleTopicUseCase } from '@/domain/usecase/seo-article-topic'
import { buildSEOArticleProofreadingUseCase, SEOArticleProofreadingUseCase } from '@/domain/usecase/seo-article-proofreading'
import { buildSEOArticleExpertUseCase, SEOArticleExpertUseCase } from '@/domain/usecase/seo-article-expert'
import { buildSEOArticleExpertJobHistoryUseCase, SEOArticleExpertJobHistoryUseCase } from '@/domain/usecase/seo-article-expert-job-history'
import { AIToolsUseCase, buildAIToolsUseCase } from './ai-tools'

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
    aiTools: buildAIToolsUseCase(params)
  }
}
