import { InvalidDataError } from '@/domain/errors'
import { getPKCE } from './pkce'
import { CustomOAuthHandlers, OAuthProviders } from './internal-types'
import { GetConsentURL } from './types'

export const buildGetConsentURL = ({
  providers,
  customHandlers
}: {
  providers: OAuthProviders
  customHandlers: CustomOAuthHandlers
}): GetConsentURL => {
  return async ({ provider, redirect_uri }) => {
    if (!providers[provider]) {
      throw new InvalidDataError({
        code: 'INVALID_OAUTH_PROVIDER'
      })
    }

    if (customHandlers[provider]) {
      const getConsentURL = customHandlers[provider].getConsentURL
      return getConsentURL({ provider, redirect_uri })
    }

    const clientId = providers[provider].clientId
    const authorizeURL = providers[provider].authorizeURL
    const scope = providers[provider].scope

    const pkce = await getPKCE()

    const consentURL = new URL(authorizeURL)

    consentURL.searchParams.append('client_id', clientId)
    consentURL.searchParams.append('response_type', 'code')
    consentURL.searchParams.append('redirect_uri', redirect_uri)
    consentURL.searchParams.append('code_challenge', pkce.code_challenge)
    consentURL.searchParams.append('code_challenge_method', pkce.code_challenge_method)

    if (scope) {
      consentURL.searchParams.append('scope', scope)
    }

    if (providers[provider].additionalParams) {
      for (const key in providers[provider].additionalParams) {
        const value = providers[provider].additionalParams![key]
        consentURL.searchParams.append(key, value)
      }
    }

    return {
      consentURL: consentURL.toString(),
      code_verifier: pkce.code_verifier
    }
  }
}
