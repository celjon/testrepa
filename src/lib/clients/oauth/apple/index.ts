import jwt from 'jsonwebtoken'
import { Axios } from 'axios'
import querystring from 'querystring'
import { InvalidDataError } from '@/domain/errors'
import { OAuthProviders, TokensResponse } from '../internal-types'
import { GetTokens, GetUserInfo } from '../types'

export const genereateClientSecret = ({
  clientId,
  teamId,
  keyId,
  privateKey,
}: {
  clientId: string
  teamId: string
  keyId: string
  privateKey: string
}) => {
  const expirationDays = 182 // Token expiration (6 months max)

  const now = Math.floor(Date.now() / 1000)
  const exp = now + expirationDays * 86_400

  const payload = {
    iss: teamId,
    iat: now,
    exp: exp,
    aud: 'https://appleid.apple.com',
    sub: clientId,
  }

  const clientSecret = jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: keyId,
    },
  })

  return clientSecret
}

type Params = { providerConfig: OAuthProviders[string]; axiosInstance: Axios }

export const buildAppleOAuth = (params: Params) => {
  return {
    getTokens: buildGetTokens(params),
    getUserInfo: buildGetUserInfo(params),
  }
}

const buildGetTokens = ({ axiosInstance, providerConfig }: Params): GetTokens => {
  return async ({ code, device_id, code_verifier, redirect_uri, appPlatform, identityToken }) => {
    let client_id = providerConfig.clientId
    let client_secret = providerConfig.clientSecret
    const exchangeURL = providerConfig.exchangeURL

    if (appPlatform === 'ios-app-store' && identityToken) {
      return {
        refresh_token: '',
        access_token: '', // Apple doesn't provide this for native sign in
        id_token: identityToken,
        token_type: 'Bearer',
        expires_in: 3600,
      }
    }

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
  }
}

const buildGetUserInfo =
  ({ providerConfig }: Params): GetUserInfo =>
  async ({ id_token, data, appPlatform }) => {
    const payload = jwt.decode(id_token, { json: true })

    if (
      !payload ||
      !payload.sub ||
      payload.iss !== 'https://appleid.apple.com' ||
      (payload.aud !== providerConfig.clientId && payload.aud !== providerConfig.appId)
    ) {
      throw new InvalidDataError({
        code: 'INVALID_CODE',
      })
    }

    if ('email_verified' in payload && !payload.email_verified) {
      throw new InvalidDataError({
        code: 'INVALID_CODE',
        message: 'Email is not verified',
      })
    }

    if (appPlatform === 'ios-app-store') {
      return {
        email: data?.email ?? payload.email,
        given_name: data?.name,
        avatar: undefined,
        external_id: payload.sub,
      }
    }

    if (!data || !data.email || !data.name) {
      return {
        email: payload.email,
        given_name: undefined,
        avatar: undefined,
        external_id: payload.sub,
      }
    }

    return {
      email: payload.email ?? data.email,
      given_name: data.name,
      avatar: undefined,
      external_id: payload.sub,
    }
  }
