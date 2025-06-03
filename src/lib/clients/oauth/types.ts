export type ProviderCredentials = {
  clientId: string
  clientSecret?: string
}

export type GetConsentURL = (params: { provider: string; redirect_uri: string }) => Promise<{
  consentURL: string
  code_verifier: string
}>

export type GetAccessToken = (params: {
  code: string
  device_id: string
  provider: string
  code_verifier?: string
  redirect_uri: string
}) => Promise<{
  access_token: string
  expires_in: number
}>

export type UserInfo = {
  email?: string
  tg_id?: string
  given_name?: string
  avatar?: string
}

export type GetUserInfo = (params: { access_token: string; provider: string }) => Promise<UserInfo | never>

export type OAuth2Client = {
  getConsentURL: GetConsentURL

  getAccessToken: GetAccessToken

  getUserInfo: GetUserInfo
}
