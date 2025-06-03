import { Adapter } from '@/adapter'
import { buildSendResetLink, SendResetPasswordLink } from './send-reset-password-link'
import { buildMergeAccountsInTgBot, MergeAccountsInTgBot } from './merge-accounts-in-tg-bot'
import { buildCheckCredentials, CheckCredentials } from './checkCredentials'
import { buildSignAuthTokens, signAuthTokens } from './sign-auth-tokens'
import { buildSendVerificationCode, SendVerificationCode } from './send-verification-code'
import { buildSendVerificationUpdateCode, SendVerificationUpdateCode } from '@/domain/service/auth/send-verification-update-code'

export type AuthService = {
  sendResetLink: SendResetPasswordLink
  mergeAccountsInTgBot: MergeAccountsInTgBot
  checkCredentials: CheckCredentials
  signAuthTokens: signAuthTokens
  sendVerificationCode: SendVerificationCode
  sendVerificationUpdateCode: SendVerificationUpdateCode
}
export const buildAuthService = (params: Adapter): AuthService => {
  const sendResetLink = buildSendResetLink(params)
  const mergeAccountsInTgBot = buildMergeAccountsInTgBot(params)
  const checkCredentials = buildCheckCredentials(params)
  const signAuthTokens = buildSignAuthTokens()
  const sendVerificationCode = buildSendVerificationCode(params)
  const sendVerificationUpdateCode = buildSendVerificationUpdateCode(params)

  return {
    sendResetLink,
    mergeAccountsInTgBot,
    checkCredentials,
    signAuthTokens,
    sendVerificationCode,
    sendVerificationUpdateCode
  }
}
