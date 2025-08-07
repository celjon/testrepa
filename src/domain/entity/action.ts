import { Action, Platform } from '@prisma/client'
import { IUser } from './user'
import { IEnterprise } from './enterprise'
import { ITransaction } from './transaction'

export interface IAction extends Action {
  user?: IUser
  enterprise?: IEnterprise
  transaction?: ITransaction
}

export const actions = {
  TOKEN_WRITEOFF: 'token:writeoff',
  SWITCH_COMMON_POOL: 'common:pool:switch',
  SUBSCRIPTION_PURCHASE: 'subscription:purchase',
  REGISTRATION: 'registration',
}

export const validPlatforms: Platform[] = [
  Platform.BOTHUB_API,
  Platform.MAIN,
  Platform.DASHBOARD,
  Platform.TELEGRAM,

  Platform.API_COMPLETIONS,
  Platform.API_IMAGES,
  Platform.API_EMBEDDINGS,
  Platform.API_SPEECH,
  Platform.API_TRANSCRIPTIONS,
  Platform.API_TRANSLATIONS,
  Platform.API_MODERATIONS,

  Platform.ENTERPRISE,
  Platform.EASY_WRITER,
  Platform.PROMPT_QUEUE,
]

export const validSentPlatforms: Platform[] = [
  Platform.MAIN,
  Platform.DASHBOARD,
  Platform.TELEGRAM,
  Platform.BOTHUB_API,
]

export const determinePlatform = (platform?: Platform, hasEnterprise?: boolean): Platform => {
  if (hasEnterprise) return Platform.ENTERPRISE
  if (platform && validPlatforms.includes(platform)) return platform
  return Platform.BOTHUB_API
}

export const convertSentPlatform = (platform?: string): Platform | undefined => {
  const validPlatform = validSentPlatforms.find((p) => p === platform?.toUpperCase())

  return validPlatform || undefined
}
