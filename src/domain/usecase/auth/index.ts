import { UseCaseParams } from '@/domain/usecase/types'
import { buildGetMe, GetMe } from './get-me'
import { buildTelegram, Telegram } from './telegram'
import { buildRefresh, Refresh } from './refresh'
import { Authorize, buildAuthorize } from './authorize'
import { buildRegister, Register } from './register'
import { buildSendResetLink, SendResetLink } from './send-reset-link'
import { buildResetPassword, ResetPassword } from './reset-password'
import {
  buildGenerateTelegramConnectionToken,
  GenerateTelegramConnectionToken,
} from './generate-telegram-connection-token'
import { buildConnectTelegram, ConnectTelegram } from './connect-telegram'
import { buildFingerprint, Fingerprint } from './fingerprint'
import { buildVerifyEmail, VerifyEmail } from './verify-email'
import { buildOAuthAuthorize, OAuthAuthorize } from './oauth-authorize'
import { buildGetOAuthConsentURL, GetOAuthConsentURL } from './get-oauth-consent-url'
import { buildChangeEmail, ChangeEmail } from './change-email'
import { buildEnableEncryption, EnableEncryption } from './enable-encryption'
import { buildUnlinkTelegram, UnlinkTelegram } from './unlink-telegram'
import {
  buildGenerateTelegramUnlinkToken,
  GenerateTelegramUnlinkToken,
} from './generate-telegram-unlink-token'
import { buildToggleReceiveEmails, ToggleReceiveEmails } from './toggle-receive-emails'
import { buildChangePassword, ChangePassword } from './change-password'
import { buildUpdateYandexMetric, UpdateYandexMetric } from './update-yandex-metric'
import {
  buildGenerateTelegramConnectionTokenPython,
  GenerateTelegramConnectionTokenPython,
} from './generate-telegram-connection-token-python'
import { buildConnectTelegramPython, ConnectTelegramPython } from './connect-telegram-python'
import { buildLogoutAll, LogoutAll } from './logout-all'
import { buildLogout, Logout } from './logout'

export type AuthUseCase = {
  getOAuthConsentURL: GetOAuthConsentURL
  oauthAuthorize: OAuthAuthorize
  telegram: Telegram
  getMe: GetMe
  refresh: Refresh
  authorize: Authorize
  register: Register
  sendResetLink: SendResetLink
  resetPassword: ResetPassword
  generateTelegramConnectionToken: GenerateTelegramConnectionToken
  generateTelegramConnectionTokenPython: GenerateTelegramConnectionTokenPython
  connectTelegram: ConnectTelegram
  connectTelegramPython: ConnectTelegramPython
  fingerprint: Fingerprint
  verifyEmail: VerifyEmail
  changeEmail: ChangeEmail
  enableEncryption: EnableEncryption
  generateTelegramUnlinkToken: GenerateTelegramUnlinkToken
  unlinkTelegram: UnlinkTelegram
  toggleReceiveEmails: ToggleReceiveEmails
  changePassword: ChangePassword
  updateYandexMetric: UpdateYandexMetric
  logout: Logout
  logoutAll: LogoutAll
}

export const buildAuthUseCase = (params: UseCaseParams): AuthUseCase => {
  const getOAuthConsentURL = buildGetOAuthConsentURL(params)
  const oauthAuthorize = buildOAuthAuthorize(params)
  const telegram = buildTelegram(params)
  const getMe = buildGetMe(params)
  const refresh = buildRefresh(params)
  const register = buildRegister(params)
  const authorize = buildAuthorize({ ...params, registerFunc: register })
  const sendResetLink = buildSendResetLink(params)
  const resetPassword = buildResetPassword(params)
  const generateTelegramConnectionToken = buildGenerateTelegramConnectionToken(params)
  const connectTelegram = buildConnectTelegram(params)
  const verifyEmail = buildVerifyEmail(params)
  const changeEmail = buildChangeEmail(params)
  const enableEncryption = buildEnableEncryption(params)
  const generateTelegramUnlinkToken = buildGenerateTelegramUnlinkToken(params)
  const unlinkTelegram = buildUnlinkTelegram(params)
  const toggleReceiveEmails = buildToggleReceiveEmails(params)
  const changePassword = buildChangePassword(params)
  const updateYandexMetric = buildUpdateYandexMetric(params)
  const logout = buildLogout(params)
  const logoutAll = buildLogoutAll(params)

  return {
    getOAuthConsentURL,
    oauthAuthorize,
    telegram,
    getMe,
    refresh,
    authorize,
    register,
    sendResetLink,
    resetPassword,
    generateTelegramConnectionToken,
    generateTelegramConnectionTokenPython: buildGenerateTelegramConnectionTokenPython(params),
    connectTelegram,
    connectTelegramPython: buildConnectTelegramPython(params),
    fingerprint: buildFingerprint(params),
    verifyEmail,
    changeEmail,
    enableEncryption,
    generateTelegramUnlinkToken,
    unlinkTelegram,
    toggleReceiveEmails,
    changePassword,
    updateYandexMetric,
    logout,
    logoutAll,
  }
}
