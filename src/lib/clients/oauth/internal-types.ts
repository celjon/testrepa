import { GetAccessToken, GetConsentURL, GetUserInfo } from './types'

export type TokensResponse = {
  refresh_token: string
  access_token: string
  token_type: string
  expires_in: number
}

export type OAuthProvider = {
  clientId: string
  clientSecret?: string
  authorizeURL: string
  exchangeURL: string
  scope: string
  additionalParams?: Record<string, string>
}

export type OAuthProviders = {
  [key: string]: OAuthProvider
}

export type CustomOAuthHandler = {
  getConsentURL: GetConsentURL
  getAccessToken: GetAccessToken
  getUserInfo: GetUserInfo
}

export type CustomOAuthHandlers = {
  [key: string]: CustomOAuthHandler
}
