import Express from 'express'
import { buildAuthHandler } from './auth'
import { buildChatHandler } from './chat'
import { buildDeveloperHandler } from './developer'
import { buildEnterpriseHandler } from './enterprise'
import { buildGroupHandler } from './group'
import { buildMessageHandler } from './message'
import { buildModelHandler } from './model'
import { buildPlanHandler } from './plan'
import { buildPresetHandler } from './preset'
import { buildReferralHandler } from './referral'
import { buildShortcutHandler } from './shortcut'
import { IHandler } from './types'
import { buildUserHandler } from './user'
import { buildWebhookHandler } from './webhook'
import { DeliveryParams } from '@/delivery/types'
import { buildTransactionHandler } from './transaction'
import { buildAdminHandler } from './admin'
import { buildReferralTemplateHandler } from './referralTemplate'
import { buildOpenaiHandler } from './openai'
import { buildJobHandler } from './job'
import { buildMidjourneyHandler } from './midjourney'
import { buildArticleHandler } from './article'
import { buildGeoHandler } from './geo'
import { buildFileHandler } from './file'
import { buildGraphQLHandler } from './graphql'
import { buildRegionLockHandler } from './regionLock'
import { buildHealthCheckHandler } from './health-check'
import { buildDataAnalysisHandler } from './data-analysis'
import { buildSEOArticleProofreadingHandler } from './seo-article-proofreading'
import { buildSEOArticleExpertJobHistoryHandler } from './seo-article-expert-job-history'
import { buildSEOArticleExpertHandler } from './seo-article-expert'
import { buildSEOArticleTopicHandler } from './seo-article-topic'
import { buildSEOArticleCategoryHandler } from './seo-article-category'
import { buildSEOArticleHandler } from '@/delivery/http/v2/handlers/seo-article'
import { buildAIToolsHandler } from '@/delivery/http/v2/handlers/ai-tools'

export const buildHandler = (params: DeliveryParams): Express.Router => {
  const router = Express.Router()

  const handlers: Array<IHandler> = [
    buildUserHandler(params),
    buildAuthHandler(params),
    buildChatHandler(params),
    buildJobHandler(params),
    buildDeveloperHandler(params),
    buildEnterpriseHandler(params),
    buildGroupHandler(params),
    buildMessageHandler(params),
    buildModelHandler(params),
    buildPlanHandler(params),
    buildPresetHandler(params),
    buildReferralHandler(params),
    buildShortcutHandler(params),
    buildWebhookHandler(params),
    buildTransactionHandler(params),
    buildOpenaiHandler(params),
    buildAdminHandler(params),
    buildReferralTemplateHandler(params),
    buildMidjourneyHandler(params),
    buildArticleHandler(params),
    buildSEOArticleCategoryHandler(params),
    buildSEOArticleTopicHandler(params),
    buildSEOArticleExpertHandler(params),
    buildSEOArticleExpertJobHistoryHandler(params),
    buildSEOArticleProofreadingHandler(params),
    buildGeoHandler(params),
    buildFileHandler(params),
    buildGraphQLHandler(params),
    buildRegionLockHandler(params),
    buildHealthCheckHandler(params),
    buildDataAnalysisHandler(params),
    buildSEOArticleHandler(params),
    buildAIToolsHandler(params)
  ]

  for (let i = 0; i < handlers.length; i++) {
    const handler = handlers[i]

    handler.registerRoutes(router)
  }

  router.use(params.middlewares.errorHandler)

  return router
}
