import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'oauth'>

export type GetOAuthConsentURL = (params: { provider: string; redirect_uri: string }) => Promise<{
  consentURL: string
  code_verifier: string
}>

export const buildGetOAuthConsentURL = ({ oauth }: Params): GetOAuthConsentURL => {
  return async ({ provider, redirect_uri }) => {
    return oauth.client.getConsentURL({
      provider,
      redirect_uri,
    })
  }
}
