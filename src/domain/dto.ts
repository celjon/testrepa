export type OpenAiModerateResponseDto = {
  flagged: boolean
  categories: {
    sexual: boolean
    hate: boolean
    harassment: boolean
    'self-harm': boolean
    'sexual/minors': boolean
    'hate/threatening': boolean
    'violence/graphic': boolean
    'self-harm/intent': boolean
    'self-harm/instructions': boolean
    'harassment/threatening': boolean
    violence: boolean
  }
}

export type OpenAiVisionModerateResponseDto = {
  flagged: boolean
}

export type SoftLimitNotificationJobDto = {
  to: string
  subscriptionId: string
}

export type ICountryResponse = {
  [key in 'continent' | 'country' | 'registered_country']?: {
    geoname_id?: number
    iso_code?: string
    code?: 'AF' | 'AN' | 'AS' | 'EU' | 'NA' | 'OC' | 'SA'
    names?: {
      [key in 'de' | 'en' | 'fr' | 'ja' | 'pt-BR' | 'ru' | 'zh-CN']?: string
    }
  }
}
