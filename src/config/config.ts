import path from 'path'
import fs from 'fs'
import YAML from 'yaml'
import { z } from 'zod'
import os from 'node:os'
import { PlanType } from '@prisma/client'

export const requiredEnvVars = [
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'PGDATA',
  'DATABASE_URL',
]

const configSchema = z.object({
  http: z.object({
    host: z.string(),
    port: z.number(),
    webhook_real_address: z.string().default('https://bothub.chat/api/v2/'),
    real_address: z.string(),
    logs: z.boolean().default(true),
  }),
  logs: z
    .object({
      level: z.enum(['info', 'error', 'debug']).default('info'),
    })
    .default({ level: 'info' }),
  postgres: z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
    db: z.string(),
  }),
  clickhouse: z.object({
    url: z.string(),
    protocol: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
    db: z.string(),
  }),
  redis: z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
  }),
  jwt: z.object({
    secret: z.string(),
  }),
  google: z.object({
    oauth: z.object({
      client_id: z.string(),
      client_secret: z.string(),
    }),
  }),
  yandex: z.object({
    oauth: z.object({
      client_id: z.string(),
      client_secret: z.string(),
    }),
  }),
  vk: z.object({
    oauth: z.object({
      client_id: z.string(),
    }),
  }),
  apple: z.object({
    oauth: z.object({
      client_id: z.string(),
      app_id: z.string(),
      team_id: z.string(),
      key_id: z.string(),
      private_key: z.string(),
    }),
  }),
  yoomoney: z.object({
    shop_id: z.number(),
    secret_key: z.string(),
    gateway: z.object({
      key: z.string(),
      agent_id: z.number(),
    }),
  }),
  frontend: z.object({
    address: z.string(),
    default_locale: z.enum(['ru', 'kz', 'en', 'es', 'fr', 'pt']),
  }),
  hashbon: z.object({
    shop_id: z.number(),
    secret_key: z.string(),
  }),
  tinkoff: z.object({
    terminal_key: z.string(),
    merchant_password: z.string(),
  }),
  minio: z.object({
    host: z.string(),
    port: z.number().nullable(),
    access_key: z.string(),
    bucket: z.string(),
    instance_folder: z.string(),
    secret_key: z.string(),
  }),
  proxy: z.object({
    protocol: z.string().or(z.undefined()),
    auth: z
      .object({
        username: z.string(),
        password: z.string(),
      })
      .or(z.undefined()),
    host: z.string(),
    port: z.number(),
  }),
  telegram: z.object({
    bot: z.object({
      secret_key: z.string(),
      hook_url: z.string(),
    }),
    bot_python: z
      .object({
        hook_url: z.string(),
      })
      .optional(),
    oauth: z.object({
      bot_token: z.string(),
    }),
  }),
  default_customer_email: z.string(),
  metrics: z.object({
    yandex: z.object({
      counter: z.number(),
      access_token: z.string(),
    }),
  }),
  stripe: z.object({
    secret_key: z.string(),
    webhook_secret: z.string(),
  }),
  model_providers: z.object({
    openai: z.object({
      id: z.string(),
      name: z.string(),
      keys: z.record(z.string(), z.number()),
      dalle: z.object({
        keys: z.record(z.string(), z.number()),
      }),
      moderation: z.object({
        keys: z.record(z.string(), z.number()),
      }),
      transcription: z.object({
        keys: z.record(z.string(), z.number()),
      }),
      speech: z.object({
        keys: z.record(z.string(), z.number()),
      }),
    }),
    voyage: z.object({
      api_key: z.string(),
    }),
    midjourney: z.object({
      id: z.string(),
      name: z.string(),
      api_url: z.string(),
      supported_accounts: z.boolean(),
      supported_account_queue_types: z.array(z.enum(['SEQUENTIAL', 'USAGE_LIMITS', 'INTERVAL'])),
    }),
    openrouter: z.object({
      id: z.string(),
      name: z.string(),
      api_url: z.string(),
      keys: z.record(z.string(), z.number()),
    }),
    g4f: z.object({
      id: z.string(),
      name: z.string(),
      api_url: z.string(),
      har_manager_url: z.string(),
      encryption_key: z.string(),
      supported_accounts: z.boolean(),
      supported_account_queue_types: z.array(z.enum(['SEQUENTIAL', 'USAGE_LIMITS', 'INTERVAL'])),
      balancer: z
        .object({
          enabled: z.boolean().default(false),
        })
        .default({ enabled: false }),
      logs: z.boolean().default(false),
    }),
    replicate: z.object({
      id: z.string(),
      name: z.string(),
      keys: z.record(z.string(), z.number()),
      balancer: z
        .object({
          disabled: z.boolean().default(false),
        })
        .default({ disabled: false }),
    }),
    runway: z.object({
      id: z.string(),
      name: z.string(),
      key: z.string(),
      balancer: z
        .object({
          disabled: z.boolean().default(false),
        })
        .default({ disabled: false }),
    }),
    assemblyAI: z.object({
      id: z.string(),
      name: z.string(),
      key: z.string(),
      balancer: z
        .object({
          disabled: z.boolean().default(false),
        })
        .default({ disabled: false }),
    }),
    googleGenAI: z.object({
      id: z.string(),
      name: z.string(),
      project: z.string(),
      location: z.string(),
      keyFileJson: z.string(),
      balancer: z
        .object({
          disabled: z.boolean().default(false),
        })
        .default({ disabled: false }),
    }),
    ai302: z.object({
      id: z.string(),
      name: z.string(),
      key: z.string(),
      api_url: z.string(),
      balancer: z
        .object({
          disabled: z.boolean().default(false),
        })
        .default({ disabled: false }),
    }),
  }),
  admin: z.object({
    password: z.string(),
    allowed_ips: z.array(z.string()),
  }),
  blocked_countries: z.array(z.string()),
  plans: z.record(
    z.string(),
    z.object({
      price_usd: z.number(),
      price_rub: z.number(),
      tokens: z.number(),
    }),
  ),
  mail: z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
  }),
  tg_notification_bot: z.object({
    bot_token: z.string(),
    chat_id: z.string(),
    reply_to_message_id: z.number().optional(),
    default_message_thread_id: z.number().optional(),
  }),
  upload_constraints: z.object({
    max_text_file_size: z.number().default(2097152),
    max_image_file_size: z.number().default(5242880),
    max_video_file_size: z.number().default(7340032),
    max_assemblyai_file_size: z.number().default(104857600),
    max_runway_file_size: z.number().default(3500000),
  }),
  jina: z.object({
    url: z.string(),
    key: z.string(),
  }),
  serp: z.object({
    url: z.string(),
    key: z.string(),
  }),
  dynamic_proxy: z.object({
    protocol: z.string().or(z.undefined()),
    auth: z.object({
      username: z.string(),
      password: z.string(),
    }),
    host: z.string(),
    port: z.number(),
  }),
  timeouts: z.object({
    youtube: z.number(),
    url_reader: z.number(),
    web_search: z.number(),
    midjourney_timeout_between_requests: z.number().default(120_000),
    g4f_send: z.number().default(10_000),
    g4f_timeout_between_requests: z.number().default(30_000),
    midjourney_imagine_fast: z.number().default(360_000),
    midjourney_imagine_relax: z.number().default(1_800_000),
    midjourney_describe: z.number().default(360_000),
  }),
  exaAI: z.object({
    key: z.string(),
  }),
  data_analysis_service: z.object({
    api_url: z.string(),
  }),
  constantCosts: z.object({
    [PlanType.FREE]: z.number(),
    [PlanType.BASIC]: z.number(),
    [PlanType.PREMIUM]: z.number(),
    [PlanType.DELUXE]: z.number(),
    [PlanType.ELITE]: z.number(),
  }),
  theSizeOfTheBundleForSendingGeneratedLinksToArticles: z.number(),
  promptQueue: z.object({
    maxQueuesPerUser: z.number(),
    maxPromptsPerQueue: z.number(),
  }),
  openrouter_proxy: z.object({
    enabled: z.boolean(),
    protocol: z.string().or(z.undefined()),
    auth: z.object({
      username: z.string(),
      password: z.string(),
    }),
    host: z.string(),
    port: z.number(),
  }),
})

export type Config = z.infer<typeof configSchema>

const defaultConfigPath = 'config/config.yml'

const parseConfig = (): Config => {
  const configAbsPath = path.resolve(process.cwd(), defaultConfigPath)

  const file = fs.readFileSync(configAbsPath, 'utf-8')

  const config: Config = YAML.parse(file)

  const result = configSchema.safeParse(config)

  if (!result.success) {
    throw new Error(JSON.stringify(result.error))
  }

  return result.data
}

export const config = parseConfig()

export const devMode = process.env.NODE_ENV === 'development'

export const workerCount = process.env.WORKER_COUNT
  ? parseInt(process.env.WORKER_COUNT)
  : os.cpus().length - 1
