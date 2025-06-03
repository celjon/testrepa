import { AdapterParams } from '@/adapter/types'
import { buildMergeAccountsInTgBot, MergeAccountsInTgBot } from './mergeAccountsInTgBot'
import { buildVerifyOAuth, VerifyOAuth } from './verifyOAuth'
import { buildGetOAuthConsentURL, GetOAuthConsentURL } from './getOAuthConsentURL'
import { buildUnlinkAccountInTgBot, UnlinkAccountInTgBot } from './unlinkAccountInTgBot'

type Params = Pick<AdapterParams, 'db' | 'oauth' | 'mail' | 'tgBot'>

export type AuthRepository = {
  getOAuthConsentURL: GetOAuthConsentURL
  verifyOAuth: VerifyOAuth
  mergeAccountsInTgBot: MergeAccountsInTgBot
  unlinkAccountInTgBot: UnlinkAccountInTgBot
}
export const buildAuthRepository = (params: Params): AuthRepository => {
  const getOAuthConsentURL = buildGetOAuthConsentURL(params)
  const verifyOAuth = buildVerifyOAuth(params)
  const mergeAccountsInTgBot = buildMergeAccountsInTgBot(params)
  const unlinkAccountInTgBot = buildUnlinkAccountInTgBot(params)
  return {
    getOAuthConsentURL,
    verifyOAuth,
    mergeAccountsInTgBot,
    unlinkAccountInTgBot
  }
}
