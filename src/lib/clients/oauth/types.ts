export type ProviderCredentials = {
  clientId: string
  appId?: string // Optional for Apple OAuth
  clientSecret?: string
  teamId?: string
  keyId?: string
  privateKey?: string
}

export type GetConsentURL = (params: { provider: string; redirect_uri: string }) => Promise<{
  consentURL: string
  code_verifier: string
}>

export type GetTokens = (params: {
  code: string
  device_id: string
  provider: string
  code_verifier?: string
  redirect_uri: string
  appPlatform: 'ios-app-store' | undefined
  identityToken?: string
}) => Promise<{
  access_token: string
  id_token: string
  expires_in: number
}>

export type UserInfo = {
  email?: string
  tg_id?: string
  given_name?: string
  avatar?: string
  external_id: string | null
}

export type GetUserInfo = (params: {
  provider: string
  access_token: string
  id_token: string
  data: {
    email?: string
    name?: string
  } | null
  appPlatform?: 'ios-app-store'
}) => Promise<UserInfo | never>

export type OAuth2Client = {
  getConsentURL: GetConsentURL

  getTokens: GetTokens

  getUserInfo: GetUserInfo
}
