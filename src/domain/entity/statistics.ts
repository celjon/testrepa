export enum Product {
  DASHBOARD = 'DASHBOARD',
  TELEGRAM = 'TELEGRAM',
  EASY_WRITER = 'EASY_WRITER',
  PROXY_API = 'PROXY_API',
  BOTHUB_API = 'BOTHUB_API',
  WEB_TRANSCRIPTION = 'WEB_TRANSCRIPTION',
  WEB_IMAGE_GENERATION = 'WEB_IMAGE_GENERATION',
  TG_TRANSCRIPTION = 'TG_TRANSCRIPTION',
  TG_IMAGE_GENERATION = 'TG_IMAGE_GENERATION',
  MIDJOURNEY = 'MIDJOURNEY',
  WEB_SEARCH = 'WEB_SEARCH',
  VIDEO_GENERATION = 'VIDEO_GENERATION'
}

export const validProducts = [
  Product.DASHBOARD,
  Product.TELEGRAM,
  Product.EASY_WRITER,
  Product.PROXY_API,
  Product.BOTHUB_API,
  Product.WEB_TRANSCRIPTION,
  Product.WEB_IMAGE_GENERATION,
  Product.TG_TRANSCRIPTION,
  Product.TG_IMAGE_GENERATION,
  Product.MIDJOURNEY,
  Product.WEB_SEARCH,
  Product.VIDEO_GENERATION
]

export const isValidProduct = (maybeProduct: string): maybeProduct is Product => (validProducts as string[]).includes(maybeProduct)

export type ProductUsage = Array<{
  month: number
  year: number
  usage: {
    free: {
      caps: number
      requests: bigint
    }
    basic: {
      caps: number
      requests: bigint
    }
    premium: {
      caps: number
      requests: bigint
    }
    deluxe: {
      caps: number
      requests: bigint
    }
    elite: {
      caps: number
      requests: bigint
    }
    totalPaid: {
      caps: number
      requests: bigint
    }
  }
}>
