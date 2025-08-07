import OpenAi from 'openai'
import { YoomoneyClient } from '@/lib/clients/yoomoney'
import { HashbonClient } from '@/lib/clients/hashbon'
import { Client as RedisClient } from '@/lib/clients/redis.client'
import * as nodemailer from 'nodemailer'
import { TgBotClient } from '@/lib/clients/tg-bot'
import { TinkoffClient } from '@/lib/clients/tinkoff'
import * as Minio from 'minio'
import { midjourneyApiAccount, MidjourneyApiClient } from '@/lib/clients/midjourney-api'
import Stripe from 'stripe'
import { G4FClient } from '@/lib/clients/g4f'
import { OpenRouterClient } from '@/lib/clients/openrouter'
import { JinaApiClient } from '@/lib/clients/jina'
import { SerpApiClient } from '@/lib/clients/serp'
import Replicate from 'replicate'
import { YoutubeDataClient } from '@/lib/clients/youtube/types'
import { OAuth2Client as GenericOAuthClient } from '@/lib/clients/oauth'
import { TgBotApiClient } from '@/lib/clients/tg-bot-api'
import { ExaAIClient } from '@/lib/clients/exaai.client'
import { PrismaClientWithExtensions } from '@/lib/clients/prisma.client'
import { AssemblyAI } from 'assemblyai'
import { YandexMetricClient } from '@/lib/clients/yandex-metric.client'
import { CurrencyToRubRateClient } from '@/lib/clients/currency-to-rub-rate.client'
import { DataAnalysisServiceClient } from '@/lib/clients/data-analysis-service'
import RunwayML from '@runwayml/sdk'
import { Queues } from '@/queues/types'
import { ClickHouseClient } from '@clickhouse/client'
import { GoogleGenAI } from '@google/genai'
import { ai302Client } from '@/lib/clients/ai-302.client'

export type UnknownTx = unknown

export type AdapterParams = {
  db: {
    client: PrismaClientWithExtensions
    getContextClient: (tx?: unknown) => PrismaClientWithExtensions
  }
  clickhouse: {
    client: ClickHouseClient
  }
  oauth: {
    client: GenericOAuthClient
  }
  openaiBalancer: {
    next: () => { client: OpenAi }
  }
  midjourneyBalancer: {
    account: midjourneyApiAccount
    findById: (id: string) => MidjourneyApiClient | undefined
  }
  redis: {
    client: { main: RedisClient; cancelFns: Record<string, () => void> }
  }
  yoomoney: {
    client: YoomoneyClient
  }
  hashbon: {
    client: HashbonClient
  }
  mail: {
    client: nodemailer.Transporter
  }
  tgBot: {
    client: TgBotApiClient
  }
  openRouter: {
    client: OpenRouterClient
  }
  openRouterBalancer: {
    next: () => { client: OpenAi }
  }
  openaiModerationBalancer: {
    next: () => { client: OpenAi }
  }
  openaiTranscriptionBalancer: {
    next: () => { client: OpenAi }
  }
  openaiDalleBalancer: {
    next: () => { client: OpenAi }
  }
  tinkoff: {
    client: TinkoffClient
  }
  minio: {
    client: Minio.Client
  }
  queues: Queues
  stripe: {
    client: Stripe
  }
  tgNotificationBot: {
    client: TgBotClient
  }
  g4f: {
    client: G4FClient
  }
  jinaApi: {
    client: JinaApiClient
  }
  serpApi: {
    client: SerpApiClient
  }
  replicate: {
    client: Replicate
  }
  replicateBalancer: {
    next: () => { client: Replicate }
  }
  youtube: {
    client: YoutubeDataClient
  }
  exaAI: {
    client: ExaAIClient
  }
  assemblyAI: {
    client: AssemblyAI
  }
  runway: {
    client: RunwayML
  }
  yandexMetric: {
    client: YandexMetricClient
  }
  currencyToRubRate: {
    client: CurrencyToRubRateClient
  }
  dataAnalysisService: {
    client: DataAnalysisServiceClient
  }
  googleGenAI: { client: GoogleGenAI }
  ai302: {
    client: ai302Client
  }
}
