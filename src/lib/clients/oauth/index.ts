import axios from 'axios'
import { OAuth2Client, ProviderCredentials } from './types'
import { buildGetConsentURL } from './getConsentURL'
import { buildGetAccessToken } from './getAccessToken'
import { buildGetUserInfo } from './getUserInfo'
import { buildTelegramOAuth } from './telegram'

const buildProviders = (credentials: Record<string, ProviderCredentials>) => {
  return {
    google: {
      clientId: credentials.google.clientId,
      clientSecret: credentials.google.clientSecret,
      authorizeURL: 'https://accounts.google.com/o/oauth2/v2/auth',
      exchangeURL: 'https://www.googleapis.com/oauth2/v4/token',
      scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
    },
    // https://yandex.ru/dev/id/doc/ru/codes/code-url
    yandex: {
      clientId: credentials.yandex.clientId,
      clientSecret: credentials.yandex.clientSecret,
      authorizeURL: 'https://oauth.yandex.ru/authorize',
      exchangeURL: 'https://oauth.yandex.ru/token',
      scope: '', // leave empty to use settings from registered app
      additionalParams: {
        force_confirm: 'yes'
      }
    },
    // https://id.vk.com/about/business/go/docs/ru/vkid/latest/vk-id/connection/start-integration/auth-flow-web#Bez-SDK-s-obmenom-koda-na-bekende
    vk: {
      clientId: credentials.vk.clientId,
      authorizeURL: 'https://id.vk.com/authorize',
      exchangeURL: 'https://id.vk.com/oauth2/auth',
      scope: 'email vkid.personal_info',
      additionalParams: {
        prompt: 'consent',
        provider: 'vkid' // vkid, ok_ru, mail_ru
      }
    },
    telegram: {
      clientId: credentials.telegram.clientId,
      authorizeURL: 'https://oauth.telegram.org/auth',
      exchangeURL: '',
      scope: ''
    }
  }
}

export const newClient = async (
  credentials: Record<string, ProviderCredentials>
): Promise<{
  client: OAuth2Client
}> => {
  const axiosInstance = axios.create({})
  const providers = buildProviders(credentials)

  const telegramCustomHandler = buildTelegramOAuth(providers.telegram)
  const customHandlers = { telegram: telegramCustomHandler }

  const getConsentURL = buildGetConsentURL({ providers, customHandlers })
  const getAccessToken = buildGetAccessToken({
    axiosInstance,
    providers,
    customHandlers
  })
  const getUserInfo = buildGetUserInfo({
    axiosInstance,
    providers,
    customHandlers
  })

  return {
    client: {
      getConsentURL,
      getAccessToken,
      getUserInfo
    }
  }
}

export * from './types'
