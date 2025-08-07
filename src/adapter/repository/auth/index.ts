import { AdapterParams } from '@/adapter/types'
import { buildMergeAccountsInTgBot, MergeAccountsInTgBot } from './merge-accounts-in-tg-bot'
import { buildVerifyOAuth, VerifyOAuth } from './verify-oauth'
import { buildGetOAuthConsentURL, GetOAuthConsentURL } from './get-oauth-consent-url'
import { buildUnlinkAccountInTgBot, UnlinkAccountInTgBot } from './unlink-account-in-tg-bot'

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
    unlinkAccountInTgBot,
  }
}
