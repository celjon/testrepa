import { Adapter } from '../types'
import { AuthService, buildAuthService } from './auth'
import { buildChatService, ChatService } from './chat'
import { buildDeveloperKeyService, DeveloperKeyService } from './developerKey'
import { buildEmployeeService, EmployeeService } from './employee'
import { buildEnterpriseService, EnterpriseService } from './enterprise'
import { buildEnterpriseUsageModerationService, EnterpriseUsageModerationService } from './enterpriseUsageModeration'
import { buildFileService, FileService } from './file'
import { buildGeoService, GeoService } from './geo'
import { buildGroupService, GroupService } from './group'
import { buildJobService, JobService } from './job'
import { buildMessageService, MessageService } from './message'
import { buildMidjourneyService, MidjourneyService } from './midjourney'
import { buildModelService, ModelService } from './model'
import { buildModerationService, ModerationService } from './moderation'
import { buildPaymentService, PaymentService } from './payment'
import { buildPlanService, PlanService } from './plan'
import { buildReferralTemplateService, ReferralTemplateService } from './referralTemplate'
import { buildSpeech2TextService, Speech2TextService } from './speech2text'
import { buildSubscriptionService, SubscriptionService } from './subscription'
import { buildTransactionService, TransactionService } from './transaction'
import { buildUserService, UserService } from './user'
import { buildDataAnalysisService, DataAnalysisService } from './data-analysis'
import { ArticleService, buildArticleService } from './article'
import { buildSEOArticleCategoryService, SEOArticleCategoryService } from './seo-article-category'
import { AIToolsService, buildAIToolsService } from './ai-tools'

export type Service = {
  auth: AuthService
  chat: ChatService
  user: UserService
  group: GroupService
  message: MessageService
  plan: PlanService
  transaction: TransactionService
  payment: PaymentService
  model: ModelService
  moderation: ModerationService
  developerKey: DeveloperKeyService
  enterprise: EnterpriseService
  employee: EmployeeService
  referralTemplate: ReferralTemplateService
  job: JobService
  subscription: SubscriptionService
  enterpriseUsageModeration: EnterpriseUsageModerationService
  midjourney: MidjourneyService
  geo: GeoService
  file: FileService
  dataAnalysis: DataAnalysisService
  speech2Text: Speech2TextService
  article: ArticleService
  seoArticleCategory: SEOArticleCategoryService
  aiTools: AIToolsService
}

export const buildService = (params: Adapter): Service => {
  const auth = buildAuthService(params)
  const file = buildFileService(params)
  const model = buildModelService(params)
  const chat = buildChatService({
    ...params,
    modelService: model
  })
  const user = buildUserService({
    ...params,
    chatService: chat
  })
  const group = buildGroupService(params)
  const job = buildJobService({
    ...params,
    chatService: chat
  })
  const subscription = buildSubscriptionService(params)
  const moderation = buildModerationService({
    ...params,
    userService: user,
    subscriptionService: subscription,
    chatService: chat
  })
  const midjourney = buildMidjourneyService(params)
  const speech2Text = buildSpeech2TextService(params)
  const aiTools = buildAIToolsService({ ...params, modelService: model })
  const message = buildMessageService({
    ...params,
    chatService: chat,
    jobService: job,
    subscriptionService: subscription,
    userService: user,
    moderationService: moderation,
    midjourneyService: midjourney,
    modelService: model,
    fileService: file,
    speech2TextService: speech2Text,
    aiToolsService: aiTools
  })
  const plan = buildPlanService(params)
  const transaction = buildTransactionService(params)
  const payment = buildPaymentService(params)
  const developerKey = buildDeveloperKeyService(params)
  const enterprise = buildEnterpriseService(params)
  const employee = buildEmployeeService(params)
  const referralTemplate = buildReferralTemplateService(params)
  const geo = buildGeoService(params)
  const dataAnalysis = buildDataAnalysisService(params)
  const article = buildArticleService(params)
  const seoArticleCategory = buildSEOArticleCategoryService(params)

  return {
    enterpriseUsageModeration: buildEnterpriseUsageModerationService(params),
    auth,
    chat,
    user,
    group,
    message,
    plan,
    transaction,
    payment,
    model,
    developerKey,
    enterprise,
    employee,
    referralTemplate,
    job,
    subscription,
    moderation,
    midjourney,
    geo,
    file,
    dataAnalysis,
    speech2Text,
    article,
    seoArticleCategory,
    aiTools
  }
}
