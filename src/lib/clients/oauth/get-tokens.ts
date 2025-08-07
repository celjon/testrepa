import { Axios, isAxiosError } from 'axios'
import querystring from 'querystring'
import { InvalidDataError } from '@/domain/errors'
import { CustomOAuthHandlers, OAuthProviders, TokensResponse } from './internal-types'
import { GetTokens } from './types'
import { logger } from '@/lib/logger'

export const buildGetTokens = ({
  axiosInstance,
  providers,
  customHandlers,
}: {
  axiosInstance: Axios
  providers: OAuthProviders
  customHandlers: CustomOAuthHandlers
}): GetTokens => {
  return async ({
    code,
    device_id,
    provider,
    code_verifier,
    redirect_uri,
    appPlatform,
    identityToken,
  }) => {
    if (!providers[provider]) {
      throw new InvalidDataError({
        code: 'INVALID_OAUTH_PROVIDER',
      })
    }

    try {
      if (customHandlers[provider]?.getTokens) {
        const getTokens = customHandlers[provider].getTokens
        return getTokens({
          code,
          device_id,
          provider,
          code_verifier,
          redirect_uri,
          appPlatform,
          identityToken,
        })
      }

      const client_id = providers[provider].clientId
      const client_secret = providers[provider].clientSecret
      const exchangeURL = providers[provider].exchangeURL

      const response = await axiosInstance.post<TokensResponse>(
        exchangeURL,
        querystring.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri,
          code_verifier,
          client_id,
          ...(device_id && {
            device_id,
          }),
          ...(client_secret && {
            client_secret: client_secret,
          }),
        }),
      )

      if ('error' in response.data) {
        throw new InvalidDataError({
          code: 'INVALID_CODE',
        })
      }

      return response.data
    } catch (e) {
      if (isAxiosError(e)) {
        logger.error('oauthClient.getTokens', {
          message: e.message,
          data: e.response?.data,
          code: e.code,
          status: e.status,
          config: {
            method: e.config?.method,
            url: e.config?.url,
            data: e.config?.data,
          },
        })
      } else {
        logger.error('oauthClient.getTokens', e)
      }

      throw new InvalidDataError({
        code: 'INVALID_CODE',
      })
    }
  }
}
