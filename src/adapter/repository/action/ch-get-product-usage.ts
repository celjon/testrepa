import { Product, ProductUsage } from '@/domain/entity/statistics'
import { AdapterParams } from '@/adapter/types'
import { toCHDateTime } from '@/lib/utils/to-ch-date-time'
import { Platform } from '@prisma/client'

type Params = Pick<AdapterParams, 'clickhouse'>

const productFilters = {
  [Product.DASHBOARD]: {
    platforms: [Platform.DASHBOARD],
    modelFeatures: [],
  },
  [Product.TELEGRAM]: {
    platforms: [Platform.TELEGRAM],
    modelFeatures: [],
  },
  [Product.EASY_WRITER]: {
    platforms: [Platform.EASY_WRITER],
    modelFeatures: [],
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
      Platform.API_EMBEDDINGS,
    ],
    modelFeatures: [],
  },
  [Product.BOTHUB_API]: {
    platforms: [Platform.BOTHUB_API],
    modelFeatures: [],
  },
  [Product.WEB_TRANSCRIPTION]: {
    platforms: [Platform.BOTHUB_API, Platform.WEB, Platform.MAIN, Platform.DASHBOARD],
    modelFeatures: ['AUDIO_TO_TEXT'],
  },
  [Product.WEB_IMAGE_GENERATION]: {
    platforms: [Platform.BOTHUB_API, Platform.WEB, Platform.MAIN, Platform.DASHBOARD],
    modelFeatures: ['TEXT_TO_IMAGE', 'TEXT_TO_IMAGE_LLM'],
  },
  [Product.TG_TRANSCRIPTION]: {
    platforms: [Platform.TELEGRAM],
    modelFeatures: ['AUDIO_TO_TEXT'],
  },
  [Product.TG_IMAGE_GENERATION]: {
    platforms: [Platform.TELEGRAM],
    modelFeatures: ['TEXT_TO_IMAGE', 'TEXT_TO_IMAGE_LLM'],
  },
  [Product.MIDJOURNEY]: {
    platforms: [Platform.WEB, Platform.MAIN, Platform.DASHBOARD, Platform.TELEGRAM],
    modelFeatures: [],
  },
  [Product.WEB_SEARCH]: {
    platforms: [Platform.WEB, Platform.MAIN, Platform.DASHBOARD, Platform.TELEGRAM],
    modelFeatures: ['TEXT_TO_TEXT'],
  },
  [Product.VIDEO_GENERATION]: {
    platforms: [Platform.WEB, Platform.MAIN, Platform.DASHBOARD, Platform.TELEGRAM],
    modelFeatures: ['TEXT_TO_VIDEO', 'IMAGE_TO_VIDEO'],
  },
}

export type ChGetProductUsage = (p: {
  dateFrom: string
  dateTo: string
  product: Exclude<Exclude<Product, Product.GPT4FREE>, Product.GPT4FREE_EXTENDED>
}) => Promise<ProductUsage>

export const buildChGetProductUsage = ({ clickhouse }: Params): ChGetProductUsage => {
  return async ({ dateFrom, dateTo, product }) => {
    const platforms: Platform[] = productFilters[product].platforms
    const platformsStr = platforms.map((p) => `'${p}'`).join(', ')

    const modelFeatures: string[] = productFilters[product].modelFeatures

    const modelFeaturesFilter =
      modelFeatures.length > 0
        ? `AND hasAny(model_features, [${modelFeatures.map((f) => `'${f}'`).join(', ')}])`
        : ''

    const webSearchFilter = product === Product.WEB_SEARCH ? 'AND web_search IS NOT NULL' : ''

    const sumExpressions =
      product === Product.WEB_SEARCH
        ? `
      SUM(CASE WHEN plan_type = 'FREE' THEN COALESCE(toFloat64(web_search), 0) ELSE 0 END) AS free_caps,
      COUNT(CASE WHEN plan_type = 'FREE' THEN 1 ELSE NULL END) AS free_requests,
      
      SUM(CASE WHEN plan_type = 'BASIC' THEN COALESCE(toFloat64(web_search), 0) ELSE 0 END) AS basic_caps,
      COUNT(CASE WHEN plan_type = 'BASIC' THEN 1 ELSE NULL END) AS basic_requests,
      
      SUM(CASE WHEN plan_type = 'PREMIUM' THEN COALESCE(toFloat64(web_search), 0) ELSE 0 END) AS premium_caps,
      COUNT(CASE WHEN plan_type = 'PREMIUM' THEN 1 ELSE NULL END) AS premium_requests,
      
      SUM(CASE WHEN plan_type = 'DELUXE' THEN COALESCE(toFloat64(web_search), 0) ELSE 0 END) AS deluxe_caps,
      COUNT(CASE WHEN plan_type = 'DELUXE' THEN 1 ELSE NULL END) AS deluxe_requests,
      
      SUM(CASE WHEN plan_type = 'ELITE' THEN COALESCE(toFloat64(web_search), 0) ELSE 0 END) AS elite_caps,
      COUNT(CASE WHEN plan_type = 'ELITE' THEN 1 ELSE NULL END) AS elite_requests,
      
      SUM(CASE WHEN plan_type != 'FREE' THEN COALESCE(toFloat64(web_search), 0) ELSE 0 END) AS total_paid_caps,
      COUNT(CASE WHEN plan_type != 'FREE' THEN 1 ELSE NULL END) AS total_paid_requests
    `
        : `
      SUM(CASE WHEN plan_type = 'FREE' THEN amount ELSE 0 END) AS free_caps,
      COUNT(CASE WHEN plan_type = 'FREE' THEN 1 ELSE NULL END) AS free_requests,
      
      SUM(CASE WHEN plan_type = 'BASIC' THEN amount ELSE 0 END) AS basic_caps,
      COUNT(CASE WHEN plan_type = 'BASIC' THEN 1 ELSE NULL END) AS basic_requests,
      
      SUM(CASE WHEN plan_type = 'PREMIUM' THEN amount ELSE 0 END) AS premium_caps,
      COUNT(CASE WHEN plan_type = 'PREMIUM' THEN 1 ELSE NULL END) AS premium_requests,
      
      SUM(CASE WHEN plan_type = 'DELUXE' THEN amount ELSE 0 END) AS deluxe_caps,
      COUNT(CASE WHEN plan_type = 'DELUXE' THEN 1 ELSE NULL END) AS deluxe_requests,
      
      SUM(CASE WHEN plan_type = 'ELITE' THEN amount ELSE 0 END) AS elite_caps,
      COUNT(CASE WHEN plan_type = 'ELITE' THEN 1 ELSE NULL END) AS elite_requests,
      
      SUM(CASE WHEN plan_type != 'FREE' THEN amount ELSE 0 END) AS total_paid_caps,
      COUNT(CASE WHEN plan_type != 'FREE' THEN 1 ELSE NULL END) AS total_paid_requests
    `

    const query = `
      SELECT toMonth(created_at) AS month,
          toYear(created_at) AS year, ${sumExpressions}
      FROM transactions
      WHERE
        type = 'WRITE_OFF'
        AND created_at BETWEEN {dateFrom:DateTime}
        AND {dateTo:DateTime}
        AND platform IN (${platformsStr}) ${product === Product.MIDJOURNEY ? "AND model_id = 'midjourney'" : ''} ${modelFeaturesFilter}${webSearchFilter}
      GROUP BY month, year
      ORDER BY year ASC, month ASC
    `
    const data = await clickhouse.client
      .query({
        query,
        query_params: {
          dateFrom: toCHDateTime(dateFrom),
          dateTo: toCHDateTime(dateTo),
          platforms,
          modelFeaturesFilter,
          webSearchFilter,
        },
      })
      .then((res) => res.json())
      .then(
        (json) =>
          json.data as {
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
          }[],
      )

    return data.map((usage) => ({
      month: usage.month,
      year: usage.year,
      usage: {
        free: {
          caps: usage.free_caps,
          requests: usage.free_requests,
        },
        basic: {
          caps: usage.basic_caps,
          requests: usage.basic_requests,
        },
        premium: {
          caps: usage.premium_caps,
          requests: usage.premium_requests,
        },
        deluxe: {
          caps: usage.deluxe_caps,
          requests: usage.deluxe_requests,
        },
        elite: {
          caps: usage.elite_caps,
          requests: usage.elite_requests,
        },
        totalPaid: {
          caps: usage.total_paid_caps,
          requests: usage.total_paid_requests,
        },
      },
    }))
  }
}
