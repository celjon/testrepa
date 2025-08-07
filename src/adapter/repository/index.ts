import { AdapterParams } from '../types'
import { buildActionRepository, ActionRepository } from './action'
import { buildAuthRepository, AuthRepository } from './auth'
import { buildChatRepository, ChatRepository } from './chat'
import { buildChatSettingsRepository, ChatSettingsRepository } from './chat-settings'
import { buildDeveloperKeyRepository, DeveloperKeyRepository } from './developer-key'
import { buildEmployeeRepository, EmployeeRepository } from './employee'
import { buildEmployeeGroupRepository, EmployeeGroupRepository } from './employee-group'
import { buildEnterpriseRepository, EnterpriseRepository } from './enterprise'
import {
  buildEnterpriseUsageConstraintsRepository,
  EnterpriseUsageConstraintsRepository,
} from './enterprise-usage-constraints'
import { buildFileRepository, FileRepository } from './file'
import { buildGroupRepository, GroupRepository } from './group'
import { buildJobRepository, JobRepository } from './job'
import { buildMessageRepository, MessageRepository } from './message'
import { buildMessageButtonRepository, MessageButtonRepository } from './message-button'
import { buildMessageImageRepository, MessageImageRepository } from './message-image'
import { buildModelRepository, ModelRepository } from './model'
import { buildModelFunctionRepository, ModelFunctionRepository } from './model-function'
import { buildOpenaiLikeRepository, OpenaiLikeRepository } from './openai-like'
import { buildPaymentMethodRepository, PaymentMethodRepository } from './payment-method'
import { buildPlanRepository, PlanRepository } from './plan'
import { buildPlanModelRepository, PlanModelRepository } from './plan-model'
import { buildPresetRepository, PresetRepository } from './preset'
import { buildPresetCategoryRepository, PresetCategoryRepository } from './preset-category'
import { buildReferralRepository, ReferralRepository } from './referral'
import { buildReferralTemplateRepository, ReferralTemplateRepository } from './referral-template'
import {
  buildReferralParticipantRepository,
  ReferralParticipantRepository,
} from './referral-participant'
import { buildShortcutRepository, ShortcutRepository } from './shortcut'
import { buildSubscriptionRepository, SubscriptionRepository } from './subscription'
import { buildTransactionRepository, TransactionRepository } from './transaction'
import { buildTransactor, Transactor } from './transactor'
import { buildUserRepository, UserRepository } from './user'
import { buildStrikeRepository, StrikeRepository } from './strike'
import {
  buildMidjourneyDiscordAccountRepository,
  MidjourneyDiscordAccountRepository,
} from './midjourney-discord-account'
import { buildVoiceRepository, VoiceRepository } from './voice'
import { buildModelProviderRepository, ModelProviderRepository } from './model-provider'
import { buildModelCustomRepository, ModelCustomRepository } from './model-custom'
import { buildVerificationCodeRepository, VerificationCodeRepository } from './verification-code'
import { buildArticleRepository, ArticleRepository } from './article'
import { buildModelAccountRepository, ModelAccountRepository } from './model-account'
import {
  buildModelAccountQueueRepository,
  ModelAccountQueueRepository,
} from './model-account-queue'
import {
  buildModelAccountModelRepository,
  ModelAccountModelRepository,
} from './model-account-model'
import { buildMessageSetRepository, MessageSetRepository } from './message-set'
import { buildTemporaryFileRepository, TemporaryFileRepository } from './temporary-file'
import {
  buildMidjourneyLastUsedQueueRepository,
  MidjourneyLastUsedQueueRepository,
} from './midjourney-last-used-queue'
import { buildOldEmailRepository, OldEmailRepository } from './old-email'
import { buildVideoRepository, VideoRepository } from './video'
import { buildSEOArticleExpertRepository, SEOArticleExpertRepository } from './seo-article-expert'
import {
  buildSEOArticleProofreadingRepository,
  SEOArticleProofreadingRepository,
} from './seo-article-proofreading'
import { buildSEOArticleTopicRepository, SEOArticleTopicRepository } from './seo-article-topic'
import {
  buildSEOArticleCategoryRepository,
  SEOArticleCategoryRepository,
} from './seo-article-category'
import {
  buildSEOArticleExpertJobHistoryRepository,
  SEOArticleExpertJobHistoryRepository,
} from './seo-article-expert-job-history'
import { buildModelUsageBucketRepository, ModelUsageBucketRepository } from './model-usage-bucket'
import { buildPromptQueuesRepository, PromptQueuesRepository } from './prompt-queues'
import { buildRefreshTokenRepository, RefreshTokenRepository } from './refresh-token'
import { buildGiftCertificateRepository, GiftCertificateRepository } from './gift-certificate'
import { buildExchangeRateRepository, ExchangeRateRepository } from './exchange-rate'

export type Repository = {
  authRepository: AuthRepository
  chatRepository: ChatRepository
  userRepository: UserRepository
  groupRepository: GroupRepository
  messageRepository: MessageRepository
  messageImageRepository: MessageImageRepository
  messageButtonRepository: MessageButtonRepository
  chatSettingsRepository: ChatSettingsRepository
  presetRepository: PresetRepository
  presetCategoryRepository: PresetCategoryRepository
  planRepository: PlanRepository
  transactionRepository: TransactionRepository
  subscriptionRepository: SubscriptionRepository
  modelRepository: ModelRepository
  modelFunctionRepository: ModelFunctionRepository
  modelProviderRepository: ModelProviderRepository
  modelCustomRepository: ModelCustomRepository
  modelAccountRepository: ModelAccountRepository
  modelAccountQueueRepository: ModelAccountQueueRepository
  modelAccountModelRepository: ModelAccountModelRepository
  paymentMethodRepository: PaymentMethodRepository
  developerKeyRepository: DeveloperKeyRepository
  shortcutRepository: ShortcutRepository
  enterpriseRepository: EnterpriseRepository
  employeeRepository: EmployeeRepository
  employeeGroupRepository: EmployeeGroupRepository
  referralRepository: ReferralRepository
  referralTemplateRepository: ReferralTemplateRepository
  referralParticipantRepository: ReferralParticipantRepository
  openaiLikeRepository: OpenaiLikeRepository
  planModelRepository: PlanModelRepository
  fileRepository: FileRepository
  transactor: Transactor
  jobRepository: JobRepository
  enterpriseUsageConstraintsRepository: EnterpriseUsageConstraintsRepository
  actionRepository: ActionRepository
  strikeRepository: StrikeRepository
  midjourneyDiscordAccountRepository: MidjourneyDiscordAccountRepository
  voiceRepository: VoiceRepository
  videoRepository: VideoRepository
  verificationCodeRepository: VerificationCodeRepository
  articleRepository: ArticleRepository
  seoArticleExpertRepository: SEOArticleExpertRepository
  seoArticleExpertJobHistoryRepository: SEOArticleExpertJobHistoryRepository
  seoArticleTopicRepository: SEOArticleTopicRepository
  seoArticleCategoryRepository: SEOArticleCategoryRepository
  seoArticleProofreadingRepository: SEOArticleProofreadingRepository
  messageSetRepository: MessageSetRepository
  temporaryFileRepository: TemporaryFileRepository
  midjourneyLastUsedQueueRepository: MidjourneyLastUsedQueueRepository
  oldEmailRepository: OldEmailRepository
  modelUsageBucketRepository: ModelUsageBucketRepository
  promptQueuesRepository: PromptQueuesRepository
  refreshTokenRepository: RefreshTokenRepository
  giftCertificateRepository: GiftCertificateRepository
  exchangeRateRepository: ExchangeRateRepository
}

export const buildRepository = (params: AdapterParams): Repository => {
  const authRepository = buildAuthRepository(params)
  const chatRepository = buildChatRepository(params)
  const userRepository = buildUserRepository(params)
  const groupRepository = buildGroupRepository(params)
  const messageRepository = buildMessageRepository(params)
  const messageImageRepository = buildMessageImageRepository(params)
  const messageButtonRepository = buildMessageButtonRepository(params)
  const chatSettingsRepository = buildChatSettingsRepository(params)
  const presetRepository = buildPresetRepository(params)
  const presetCategoryRepository = buildPresetCategoryRepository(params)
  const planRepository = buildPlanRepository(params)
  const transactionRepository = buildTransactionRepository(params)
  const subscriptionRepository = buildSubscriptionRepository(params)
  const modelRepository = buildModelRepository(params)
  const modelFunctionRepository = buildModelFunctionRepository(params)
  const modelProviderRepository = buildModelProviderRepository(params)
  const modelCustomRepository = buildModelCustomRepository(params)
  const modelAccountRepository = buildModelAccountRepository(params)
  const modelAccountQueueRepository = buildModelAccountQueueRepository(params)
  const modelAccountModelRepository = buildModelAccountModelRepository(params)
  const paymentMethodRepository = buildPaymentMethodRepository(params)
  const developerKeyRepository = buildDeveloperKeyRepository(params)
  const shortcutRepository = buildShortcutRepository(params)
  const enterpriseRepository = buildEnterpriseRepository(params)
  const employeeRepository = buildEmployeeRepository(params)
  const employeeGroupRepository = buildEmployeeGroupRepository(params)
  const referralRepository = buildReferralRepository(params)
  const referralTemplateRepository = buildReferralTemplateRepository(params)
  const referralParticipantRepository = buildReferralParticipantRepository(params)
  const openaiLikeRepository = buildOpenaiLikeRepository(params)
  const planModelRepository = buildPlanModelRepository(params)
  const fileRepository = buildFileRepository(params)
  const transactor = buildTransactor(params)
  const jobRepository = buildJobRepository(params)
  const enterpriseUsageConstraintsRepository = buildEnterpriseUsageConstraintsRepository(params)
  const actionRepository = buildActionRepository(params)
  const strikeRepository = buildStrikeRepository(params)
  const midjourneyDiscordAccountRepository = buildMidjourneyDiscordAccountRepository(params)
  const voiceRepository = buildVoiceRepository(params)
  const videoRepository = buildVideoRepository(params)
  const verificationCodeRepository = buildVerificationCodeRepository(params)
  const articleRepository = buildArticleRepository(params)
  const seoArticleExpertRepository = buildSEOArticleExpertRepository(params)
  const seoArticleExpertJobHistoryRepository = buildSEOArticleExpertJobHistoryRepository(params)
  const seoArticleTopicRepository = buildSEOArticleTopicRepository(params)
  const seoArticleCategoryRepository = buildSEOArticleCategoryRepository(params)
  const seoArticleProofreadingRepository = buildSEOArticleProofreadingRepository(params)
  const messageSetRepository = buildMessageSetRepository(params)
  const temporaryFileRepository = buildTemporaryFileRepository(params)
  const midjourneyLastUsedQueueRepository = buildMidjourneyLastUsedQueueRepository(params)
  const oldEmailRepository = buildOldEmailRepository(params)
  const promptQueuesRepository = buildPromptQueuesRepository(params)
  const refreshTokenRepository = buildRefreshTokenRepository(params)
  const giftCertificateRepository = buildGiftCertificateRepository(params)
  const exchangeRateRepository = buildExchangeRateRepository(params)

  return {
    enterpriseUsageConstraintsRepository,
    authRepository,
    chatRepository,
    userRepository,
    groupRepository,
    messageRepository,
    messageImageRepository,
    messageButtonRepository,
    chatSettingsRepository,
    presetRepository,
    presetCategoryRepository,
    planRepository,
    transactionRepository,
    subscriptionRepository,
    modelRepository,
    modelFunctionRepository,
    modelProviderRepository,
    modelCustomRepository,
    modelAccountRepository,
    modelAccountQueueRepository,
    modelAccountModelRepository,
    paymentMethodRepository,
    developerKeyRepository,
    shortcutRepository,
    enterpriseRepository,
    employeeRepository,
    employeeGroupRepository,
    referralRepository,
    referralTemplateRepository,
    referralParticipantRepository,
    openaiLikeRepository,
    planModelRepository,
    fileRepository,
    transactor,
    jobRepository,
    actionRepository,
    strikeRepository,
    midjourneyDiscordAccountRepository,
    voiceRepository,
    videoRepository,
    verificationCodeRepository,
    articleRepository,
    seoArticleExpertRepository,
    seoArticleExpertJobHistoryRepository,
    seoArticleTopicRepository,
    seoArticleCategoryRepository,
    seoArticleProofreadingRepository,
    messageSetRepository,
    temporaryFileRepository,
    midjourneyLastUsedQueueRepository,
    oldEmailRepository,
    modelUsageBucketRepository: buildModelUsageBucketRepository(params),
    promptQueuesRepository,
    refreshTokenRepository,
    giftCertificateRepository,
    exchangeRateRepository,
  }
}

export { ActionRepository } from './action'
export { AuthRepository } from './auth'
export { ChatRepository } from './chat'
export { ChatSettingsRepository } from './chat-settings'
export { DeveloperKeyRepository } from './developer-key'
export { EmployeeRepository } from './employee'
export { EnterpriseRepository } from './enterprise'
export { EnterpriseUsageConstraintsRepository } from './enterprise-usage-constraints'
export { FileRepository } from './file'
export { GroupRepository } from './group'
export { JobRepository } from './job'
export { MessageRepository } from './message'
export { MessageButtonRepository } from './message-button'
export { MessageImageRepository } from './message-image'
export { ModelRepository } from './model'
export { ModelFunctionRepository } from './model-function'
export { OpenaiLikeRepository } from './openai-like'
export { PaymentMethodRepository } from './payment-method'
export { PlanRepository } from './plan'
export { PlanModelRepository } from './plan-model'
export { PresetRepository } from './preset'
export { PresetCategoryRepository } from './preset-category'
export { ReferralRepository } from './referral'
export { ReferralTemplateRepository } from './referral-template'
export { ReferralParticipantRepository } from './referral-participant'
export { ShortcutRepository } from './shortcut'
export { SubscriptionRepository } from './subscription'
export { TransactionRepository } from './transaction'
export { Transactor } from './transactor'
export { UserRepository } from './user'
export { StrikeRepository } from './strike'
export { MidjourneyDiscordAccountRepository } from './midjourney-discord-account'
export { VoiceRepository } from './voice'
export { ModelProviderRepository } from './model-provider'
export { ModelCustomRepository } from './model-custom'
export { VerificationCodeRepository } from './verification-code'
export { ArticleRepository } from './article'
export { SEOArticleCategoryRepository } from './seo-article-category'
export { SEOArticleTopicRepository } from './seo-article-topic'
export { SEOArticleExpertRepository } from './seo-article-expert'
export { SEOArticleProofreadingRepository } from './seo-article-proofreading'
export { ModelAccountRepository } from './model-account'
export { ModelAccountQueueRepository } from './model-account-queue'
export { ModelAccountModelRepository } from './model-account-model'
export { MessageSetRepository } from './message-set'
export { PromptQueuesRepository } from './prompt-queues'
export { RefreshTokenRepository } from './refresh-token'
export { GiftCertificateRepository } from './gift-certificate'
export { ExchangeRateRepository } from './exchange-rate'
