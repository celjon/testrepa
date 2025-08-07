import { GetTokens, GetConsentURL, GetUserInfo } from '../types'
import { TGAuthResult } from './types'
import { InvalidDataError } from '@/domain/errors'
import { verifyTgAuthResult } from './verify-auth-result'

type Params = {
  clientId: string
  authorizeURL: string
}

export const buildTelegramOAuth = (params: Params) => {
  const getConsentURL = buildGetConsentURL(params)
  const getTokens = buildGetTokens()
  const getUserInfo = buildGetUserInfo(params)

  return {
    getConsentURL,
    getTokens,
    getUserInfo,
  }
}

const buildGetConsentURL = ({ authorizeURL, clientId }: Params): GetConsentURL => {
  return async ({ redirect_uri }) => {
    const botId = clientId.split(':')[0]
    const redirectURL = new URL(redirect_uri)

    const consentURL = new URL(authorizeURL)
    consentURL.searchParams.append('bot_id', botId)
    consentURL.searchParams.append('origin', redirectURL.origin)

    return {
      consentURL: consentURL.toString(),
      code_verifier: '',
    }
  }
}

const buildGetTokens = (): GetTokens => {
  return async ({ code }) => {
    return {
      access_token: code,
      id_token: '',
      expires_in: 0,
    }
  }
}

const buildGetUserInfo = ({ clientId }: Params): GetUserInfo => {
  return async ({ access_token }) => {
    const tgAuthResult: TGAuthResult = JSON.parse(access_token)

    if (!verifyTgAuthResult(tgAuthResult, clientId)) {
      throw new InvalidDataError({
        code: 'INVALID_CODE',
      })
    }

    return {
      tg_id: tgAuthResult.id?.toString(),
      email: undefined,
      given_name: tgAuthResult.first_name ?? tgAuthResult.username,
      avatar: tgAuthResult.photo_url,
      external_id: tgAuthResult.id?.toString(),
    }
  }
}
