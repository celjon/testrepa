import 'reflect-metadata'
import chalk from 'chalk'
import { isAxiosError } from 'axios'
import * as client from './lib/clients'
import { config as cfg, devMode, workerCount } from '@/config'
import * as adapter from '@/adapter'
import * as usecase from '@/domain/usecase'
import * as service from '@/domain/service'
import * as middlewares from '@/delivery/http/v2/middlewares'
import * as server from '@/delivery/http/server'
import * as httpV2Handler from '@/delivery/http/v2/handlers'
import * as v2Router from '@/delivery/http/v2/router'
import * as cron from '@/delivery/cron'
import * as queue from '@/delivery/queue'
import cluster from 'node:cluster'
import { log, logger } from './lib/logger'
import { getErrorString, patchBigInt } from './lib'
import { initializeQueues } from './queues'

process.on('uncaughtException', function (err) {
  logger.error({
    location: 'uncaughtException',
    message: `${getErrorString(err)}`,
    stack: err.stack,
  })
})

process.on('unhandledRejection', (reason, promise) => {
  if (isAxiosError(reason)) {
    logger.error({
      location: 'unhandledRejection',
      message: reason.message,
      data: reason.response?.data instanceof Buffer ? 'Buffer' : reason.response?.data,
      code: reason.code,
      status: reason.status,
      config: {
        method: reason.config?.method,
        url: reason.config?.url,
        data: reason.config?.data,
      },
      promise,
    })
  } else {
    logger.error({
      location: 'unhandledRejection',
      message: `${getErrorString(reason)}`,
      reason,
      promise,
    })
  }
})

const entry = async () => {
  patchBigInt()

  if (cluster.isPrimary) {
    log('Server starting...')
  }

  const redisConfig = {
    user: cfg.redis.user,
    password: cfg.redis.password,
    host: cfg.redis.host,
    port: cfg.redis.port,
  }

  const queues = initializeQueues({
    redis: redisConfig,
  })

  const stripe = client.stripe.newClient({
    secretKey: cfg.stripe.secret_key,
  })

  const db = client.prismaClient.newClient({
    user: cfg.postgres.user,
    password: cfg.postgres.password,
    host: cfg.postgres.host,
    port: cfg.postgres.port,
    db: cfg.postgres.db,
  })
  const clickhouse = client.clickhouseClient.newClient({
    user: cfg.clickhouse.user,
    protocol: cfg.clickhouse.protocol,
    password: cfg.clickhouse.password,
    url: cfg.clickhouse.url,
    port: cfg.clickhouse.port,
    db: cfg.clickhouse.db,
  })

  const openaiBalancer = client.openAiClientBalancer.buildBalancer(cfg.model_providers.openai.keys)
  const openaiModerationBalancer = client.openAiClientBalancer.buildBalancer(
    cfg.model_providers.openai.moderation.keys,
  )
  const openaiDalleBalancer = client.openAiClientBalancer.buildBalancer(
    cfg.model_providers.openai.dalle.keys,
  )
  const openaiTranscriptionBalancer = client.openAiClientBalancer.buildBalancer(
    cfg.model_providers.openai.transcription.keys,
  )

  const minio = client.minioClient.newClient({
    host: cfg.minio.host,
    accessKey: cfg.minio.access_key,
    secretKey: cfg.minio.secret_key,
    port: cfg.minio.port || undefined,
  })

  const openRouter = client.openRouterClient.newClient({
    apiUrl: cfg.model_providers.openrouter.api_url,
  })

  const openRouterBalancer = client.openrouterClientBalancer.buildBalancer({
    apiUrl: cfg.model_providers.openrouter.api_url,
    keys: cfg.model_providers.openrouter.keys,
  })

  const [redis, oauth] = await Promise.all([
    client.redis.newClient(redisConfig),
    client.oauthClient.newClient({
      google: {
        clientId: cfg.google.oauth.client_id,
        clientSecret: cfg.google.oauth.client_secret,
      },
      vk: {
        clientId: cfg.vk.oauth.client_id,
      },
      yandex: {
        clientId: cfg.yandex.oauth.client_id,
        clientSecret: cfg.yandex.oauth.client_secret,
      },
      telegram: {
        clientId: cfg.telegram.oauth.bot_token,
      },
      apple: {
        clientId: cfg.apple.oauth.client_id,
        appId: cfg.apple.oauth.app_id,
        teamId: cfg.apple.oauth.team_id,
        keyId: cfg.apple.oauth.key_id,
        privateKey: cfg.apple.oauth.private_key,
      },
    }),
  ])

  const midjourneyBalancer = client.midjourneyClientBalancer.buildBalancer()

  const yoomoney = client.yoomoneyClient.newClient({
    secretKey: cfg.yoomoney.secret_key,
    shopId: cfg.yoomoney.shop_id,
  })

  const tinkoff = client.tinkoffClient.newClient({
    merchantPassword: cfg.tinkoff.merchant_password,
    terminalKey: cfg.tinkoff.terminal_key,
    payment: {
      successRedirect: cfg.frontend.address,
      webhook: cfg.http.webhook_real_address + 'webhook/tinkoff',
    },
  })

  const hashbon = client.hashbonClient.newClient({
    secretKey: cfg.hashbon.secret_key,
    shopId: cfg.hashbon.shop_id,
  })

  const mail = client.mailClient.newClient({
    host: cfg.mail.host,
    port: cfg.mail.port,
    user: cfg.mail.user,
    password: cfg.mail.password,
  })

  const tgBot = client.tgBotApiClient.newClient({
    webhookUrl: cfg.telegram.bot.hook_url,
    pythonWebHookUrl: cfg.telegram.bot_python?.hook_url,
    secretKey: cfg.telegram.bot.secret_key,
  })
  const tgNotificationBot = client.tgBotClient.newClient({
    botToken: cfg.tg_notification_bot.bot_token,
    chatId: cfg.tg_notification_bot.chat_id,
    replyToMessageId: cfg.tg_notification_bot.reply_to_message_id,
    defaultMessageThreadId: cfg.tg_notification_bot.default_message_thread_id,
  })

  const g4f = client.g4fClient.newClient({
    apiUrl: cfg.model_providers.g4f.api_url,
    harManagerUrl: cfg.model_providers.g4f.har_manager_url,
  })
  const jinaApi = client.jinaClient.newClient({
    apiUrl: cfg.jina.url,
    apiKey: cfg.jina.key,
  })
  const serpApi = client.serpClient.newClient({
    apiUrl: cfg.serp.url,
    apiKey: cfg.serp.key,
  })

  const replicate = client.replicateClient.newClient({
    apiKey: Object.keys(cfg.model_providers.replicate.keys)[0] ?? '',
  })
  const replicateBalancer = client.replicateClientBalancer.buildBalancer({
    keys: cfg.model_providers.replicate.keys,
  })
  const runway = client.runwayClient.newClient({
    apiKey: cfg.model_providers.runway.key,
  })
  const youtube = client.youtubeClient.newClient()
  const exaAI = client.exaAIClient.newClient({
    apiKey: cfg.exaAI.key,
  })
  const assemblyAI = client.assemblyAiClient.newClient({
    apiKey: cfg.model_providers.assemblyAI.key,
  })
  const yandexMetric = client.yandexMetricClient.newClient()
  const currencyToRubRate = client.currencyToRubRate.newClient()
  const dataAnalysisService = client.dataAnalysisService.newClient({
    api_url: cfg.data_analysis_service.api_url,
  })
  const googleGenAI = client.googleGenAI.newClient({
    project: cfg.model_providers.googleGenAI.project,
    location: cfg.model_providers.googleGenAI.location,
    keyFileJson: cfg.model_providers.googleGenAI.keyFileJson,
  })
  const ai302 = client.ai302.newClient({
    key: cfg.model_providers.ai302.key,
    api_url: cfg.model_providers.ai302.api_url,
  })

  const ad = adapter.buildAdapter({
    db,
    clickhouse,
    openaiBalancer,
    openaiModerationBalancer,
    openaiTranscriptionBalancer,
    openaiDalleBalancer,
    midjourneyBalancer,
    oauth,
    yoomoney,
    hashbon,
    mail,
    tgBot,
    openRouter,
    openRouterBalancer,
    tinkoff,
    minio,
    redis,
    queues: queues.queues,
    stripe,
    tgNotificationBot,
    jinaApi,
    youtube,
    g4f,
    serpApi,
    replicate,
    replicateBalancer,
    runway,
    exaAI,
    assemblyAI,
    yandexMetric,
    currencyToRubRate,
    dataAnalysisService,
    googleGenAI,
    ai302,
  })

  const svc = service.buildService(ad)

  const uc = usecase.buildUseCase({
    service: svc,
    adapter: ad,
  })

  const mw = { middlewares: middlewares.buildMiddlewares(ad) }

  if (cluster.isPrimary && !devMode) {
    for (let i = 0; i < workerCount; i++) {
      cluster.fork()
    }

    cluster.on('exit', (worker) => {
      log(`Worker ${worker.process.pid} died.`)
    })
  }

  await Promise.all([
    svc.chat.eventStream.init(),
    svc.message.eventStream.init(),
    svc.job.init(),
    ad.healthCheckGateway.init(),
  ])

  if (cluster.isPrimary) {
    const serverPort = cfg.http.port
    const serverHost = cfg.http.host

    log(
      `Server started ${chalk.blue(`[Port: ${serverPort}]`)} ${devMode ? chalk.red('[Dev Mode]') : chalk.green('[Prod Mode]')}\n` +
        `\tAPI URL: ${chalk.gray.underline(`http://${serverHost}:${serverPort}/api/v2`)}\n` +
        `\tSwagger URL: ${chalk.gray.underline(`http://${serverHost}:${serverPort}/api/v2/swagger`)} (OpenAPI: ${chalk.gray.underline(`http://${serverHost}:${serverPort}/api/v2/swagger.json`)} )\n`,
    )
  }

  if (cluster.isPrimary) {
    const CRON = cron.buildCron({
      minioClient: minio.client,
      ...uc,
      ...ad,
      ...mw,
    })

    CRON.start()

    queue.start(
      { ...uc, ...ad, ...mw, minioClient: minio.client },
      queues.queues,
      queues.createWorker,
    )

    if (!devMode) {
      return
    }
  }

  const routerHandler = httpV2Handler.buildHandler({ ...uc, ...ad, ...mw })
  const router = v2Router.buildRouter(routerHandler, mw.middlewares)

  const srv = server.buildServer()
  const stopServerFn = srv.start(router)

  if (cluster.isWorker) {
    log(`Worker ${process.pid} started.`)
  }

  const sigListener = (signal: string) => {
    log(`${signal} received. Stopping server...`)
    process.exit(0)
  }
  const stopListener = () => {
    if (cluster.isPrimary) {
      log('Server stoped.')
    }

    stopServerFn()
    process.exit(0)
  }

  process.on('SIGINT', sigListener.bind(null, 'SIGINT'))
  process.on('SIGQUIT', sigListener.bind(null, 'SIGQUIT'))
  process.on('SIGTERM', sigListener.bind(null, 'SIGTERM'))
  process.on('exit', stopListener)
}

entry()
