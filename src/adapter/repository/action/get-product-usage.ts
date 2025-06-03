import { Platform, Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { Product, ProductUsage } from '@/domain/entity/statistics'

type Params = Pick<AdapterParams, 'db'>

const productFilters = {
  [Product.DASHBOARD]: {
    platforms: [Platform.DASHBOARD],
    modelFeatures: []
  },
  [Product.TELEGRAM]: {
    platforms: [Platform.TELEGRAM],
    modelFeatures: []
  },
  [Product.EASY_WRITER]: {
    platforms: [Platform.EASY_WRITER],
    modelFeatures: []
  },
  [Product.PROXY_API]: {
    platforms: [
      Platform.API,
      Platform.API_COMPLETIONS,
      Platform.API_IMAGES,
      Platform.API_TRANSCRIPTIONS,
      Platform.API_TRANSLATIONS,
      Platform.API_SPEECH,
      Platform.API_MODERATIONS,
      Platform.API_EMBEDDINGS
    ],
    modelFeatures: []
  },
  [Product.BOTHUB_API]: {
    platforms: [Platform.BOTHUB_API],
    modelFeatures: []
  },
  [Product.WEB_TRANSCRIPTION]: {
    platforms: [Platform.BOTHUB_API, Platform.WEB, Platform.MAIN, Platform.DASHBOARD],
    modelFeatures: ['AUDIO_TO_TEXT']
  },
  [Product.WEB_IMAGE_GENERATION]: {
    platforms: [Platform.BOTHUB_API, Platform.WEB, Platform.MAIN, Platform.DASHBOARD],
    modelFeatures: ['TEXT_TO_IMAGE', 'TEXT_TO_IMAGE_LLM']
  },
  [Product.TG_TRANSCRIPTION]: {
    platforms: [Platform.TELEGRAM],
    modelFeatures: ['AUDIO_TO_TEXT']
  },
  [Product.TG_IMAGE_GENERATION]: {
    platforms: [Platform.TELEGRAM],
    modelFeatures: ['TEXT_TO_IMAGE', 'TEXT_TO_IMAGE_LLM']
  },
  [Product.MIDJOURNEY]: {
    platforms: [Platform.WEB, Platform.MAIN, Platform.DASHBOARD, Platform.TELEGRAM],
    modelFeatures: []
  },
  [Product.WEB_SEARCH]: {
    platforms: [Platform.WEB, Platform.MAIN, Platform.DASHBOARD, Platform.TELEGRAM],
    modelFeatures: ['TEXT_TO_TEXT']
  },
  [Product.VIDEO_GENERATION]: {
    platforms: [Platform.WEB, Platform.MAIN, Platform.DASHBOARD, Platform.TELEGRAM],
    modelFeatures: ['TEXT_TO_VIDEO', 'IMAGE_TO_VIDEO']
  }
}

export type GetProductUsage = (p: { dateFrom: string; dateTo: string; product: Product }) => Promise<ProductUsage>

export const buildGetProductUsage = ({ db }: Params): GetProductUsage => {
  return async ({ dateTo, dateFrom, product }) => {
    const platforms: Platform[] = productFilters[product].platforms
    const modelFeatures: string[] = productFilters[product].modelFeatures

    const normalizedDateFrom = new Date(dateFrom).toISOString()
    const normalizedDateTo = new Date(dateTo).toISOString()

    const sumExpressions =
      product === Product.WEB_SEARCH
        ? Prisma.sql`
        SUM(CASE WHEN plans.type = 'FREE' THEN COALESCE((t.meta->'expense_details'->>'web_search')::float, 0) ELSE 0 END) AS free_caps,
        COUNT(CASE WHEN plans.type = 'FREE' THEN 1 ELSE NULL END) AS free_requests,
        
        SUM(CASE WHEN plans.type = 'BASIC' THEN COALESCE((t.meta->'expense_details'->>'web_search')::float, 0) ELSE 0 END) AS basic_caps,
        COUNT(CASE WHEN plans.type = 'BASIC' THEN 1 ELSE NULL END) AS basic_requests,
        
        SUM(CASE WHEN plans.type = 'PREMIUM' THEN COALESCE((t.meta->'expense_details'->>'web_search')::float, 0) ELSE 0 END) AS premium_caps,
        COUNT(CASE WHEN plans.type = 'PREMIUM' THEN 1 ELSE NULL END) AS premium_requests,
        
        SUM(CASE WHEN plans.type = 'DELUXE' THEN COALESCE((t.meta->'expense_details'->>'web_search')::float, 0) ELSE 0 END) AS deluxe_caps,
        COUNT(CASE WHEN plans.type = 'DELUXE' THEN 1 ELSE NULL END) AS deluxe_requests,

        SUM(CASE WHEN plans.type = 'ELITE' THEN COALESCE((t.meta->'expense_details'->>'web_search')::float, 0) ELSE 0 END) AS elite_caps,
        COUNT(CASE WHEN plans.type = 'ELITE' THEN 1 ELSE NULL END) AS elite_requests,

        SUM(CASE WHEN plans.type != 'FREE' THEN COALESCE((t.meta->'expense_details'->>'web_search')::float, 0) ELSE 0 END) AS total_paid_caps,
        COUNT(CASE WHEN plans.type != 'FREE' THEN 1 ELSE NULL END) AS total_paid_requests
      `
        : Prisma.sql`
        SUM(CASE WHEN plans.type = 'FREE' THEN t.amount ELSE 0 END) AS free_caps,
        COUNT(CASE WHEN plans.type = 'FREE' THEN 1 ELSE NULL END) AS free_requests,
        
        SUM(CASE WHEN plans.type = 'BASIC' THEN t.amount ELSE 0 END) AS basic_caps,
        COUNT(CASE WHEN plans.type = 'BASIC' THEN 1 ELSE NULL END) AS basic_requests,
        
        SUM(CASE WHEN plans.type = 'PREMIUM' THEN t.amount ELSE 0 END) AS premium_caps,
        COUNT(CASE WHEN plans.type = 'PREMIUM' THEN 1 ELSE NULL END) AS premium_requests,
        
        SUM(CASE WHEN plans.type = 'DELUXE' THEN t.amount ELSE 0 END) AS deluxe_caps,
        COUNT(CASE WHEN plans.type = 'DELUXE' THEN 1 ELSE NULL END) AS deluxe_requests,

        SUM(CASE WHEN plans.type = 'ELITE' THEN t.amount ELSE 0 END) AS elite_caps,
        COUNT(CASE WHEN plans.type = 'ELITE' THEN 1 ELSE NULL END) AS elite_requests,

        SUM(CASE WHEN plans.type != 'FREE' THEN t.amount ELSE 0 END) AS total_paid_caps,
        COUNT(CASE WHEN plans.type != 'FREE' THEN 1 ELSE NULL END) AS total_paid_requests
      `

    const usage: Array<{
      month: number
      year: number
      free_caps: number
      free_requests: bigint
      basic_caps: number
      basic_requests: bigint
      premium_caps: number
      premium_requests: bigint
      deluxe_caps: number
      deluxe_requests: bigint
      elite_caps: number
      elite_requests: bigint
      total_paid_caps: number
      total_paid_requests: bigint
    }> = await db.client.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM a.created_at) AS month,
        EXTRACT(YEAR FROM a.created_at) AS year,
        ${sumExpressions}
      FROM "Action" AS a 
      INNER JOIN transactions AS t ON a.transaction_id = t.id
      INNER JOIN subscriptions ON t.user_id = subscriptions.user_id
      INNER JOIN plans ON subscriptions.plan_id = plans.id
      ${
        modelFeatures.length > 0
          ? Prisma.sql`INNER JOIN models ON a.model_id = models.id AND (
              models.features ?| array[${Prisma.join(modelFeatures)}])`
          : Prisma.empty
      }
      WHERE 
        t.provider = 'BOTHUB' AND 
        t.type ='WRITE_OFF' AND 
        t.status = 'SUCCEDED' AND 
        t.currency = 'BOTHUB_TOKEN' AND 
        t.deleted = false AND
        t.created_at between ${normalizedDateFrom}::TIMESTAMP AND ${normalizedDateTo}::TIMESTAMP AND
        a.model_id IS NOT NULL AND
        a.platform::text IN (${Prisma.join(platforms)})
        ${product === Product.MIDJOURNEY ? Prisma.sql`AND a.model_id = 'midjourney'` : Prisma.empty}
        ${
          product === Product.WEB_SEARCH
            ? Prisma.sql`AND t.meta->'expense_details'->>'web_search' IS NOT NULL AND (t.meta->'expense_details'->>'web_search')::float > 0`
            : Prisma.empty
        }
      GROUP BY month, year
      ORDER BY year ASC, month ASC
    `

    return usage.map((usage) => ({
      month: usage.month,
      year: usage.year,
      usage: {
        free: {
          caps: usage.free_caps,
          requests: usage.free_requests
        },
        basic: {
          caps: usage.basic_caps,
          requests: usage.basic_requests
        },
        premium: {
          caps: usage.premium_caps,
          requests: usage.premium_requests
        },
        deluxe: {
          caps: usage.deluxe_caps,
          requests: usage.deluxe_requests
        },
        elite: {
          caps: usage.elite_caps,
          requests: usage.elite_requests
        },
        totalPaid: {
          caps: usage.total_paid_caps,
          requests: usage.total_paid_requests
        }
      }
    }))
  }
}
