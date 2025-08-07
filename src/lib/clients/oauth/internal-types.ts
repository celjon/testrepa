import { Axios } from 'axios'
import { GetTokens, GetConsentURL, GetUserInfo, UserInfo } from './types'

export type TokensResponse = {
  refresh_token: string
  access_token: string
  id_token: string
  token_type: string
  expires_in: number
}

export type OAuthProvider = {
  clientId: string
  appId?: string
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
  getConsentURL?: GetConsentURL
  getTokens?: GetTokens
  getUserInfo?: GetUserInfo
}

export type CustomOAuthHandlers = {
  [key: string]: CustomOAuthHandler
}

export type UserInfoGetter = (params: {
  axiosInstance: Axios
  access_token: string
  id_token: string
  providerConfig: OAuthProviders[string]
  data: {
    email?: string
    name?: string
  } | null
}) => Promise<UserInfo>
