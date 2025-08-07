import axios from 'axios'
import { OAuth2Client, ProviderCredentials } from './types'
import { buildGetConsentURL } from './get-consent-url'
import { buildGetTokens } from './get-tokens'
import { buildGetUserInfo } from './get-user-info'
import { buildTelegramOAuth } from './telegram'
import { buildAppleOAuth, genereateClientSecret } from './apple'

const buildProviders = (credentials: Record<string, ProviderCredentials>) => {
  return {
    google: {
      clientId: credentials.google.clientId,
      clientSecret: credentials.google.clientSecret,
      authorizeURL: 'https://accounts.google.com/o/oauth2/v2/auth',
      exchangeURL: 'https://www.googleapis.com/oauth2/v4/token',
      scope:
        'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    },
    // https://yandex.ru/dev/id/doc/ru/codes/code-url
    yandex: {
      clientId: credentials.yandex.clientId,
      clientSecret: credentials.yandex.clientSecret,
      authorizeURL: 'https://oauth.yandex.ru/authorize',
      exchangeURL: 'https://oauth.yandex.ru/token',
      scope: '', // leave empty to use settings from registered app
      additionalParams: {
        force_confirm: 'yes',
      },
    },
    // https://id.vk.com/about/business/go/docs/ru/vkid/latest/vk-id/connection/start-integration/auth-flow-web#Bez-SDK-s-obmenom-koda-na-bekende
    vk: {
      clientId: credentials.vk.clientId,
      authorizeURL: 'https://id.vk.com/authorize',
      exchangeURL: 'https://id.vk.com/oauth2/auth',
      scope: 'email vkid.personal_info',
      additionalParams: {
        prompt: 'consent',
        provider: 'vkid', // vkid, ok_ru, mail_ru
      },
    },
    telegram: {
      clientId: credentials.telegram.clientId,
      authorizeURL: 'https://oauth.telegram.org/auth',
      exchangeURL: '',
      scope: '',
    },
    apple: {
      clientId: credentials.apple.clientId,
      appId: credentials.apple.appId ?? '',
      clientSecret: genereateClientSecret({
        clientId: credentials.apple.clientId,
        teamId: credentials.apple.teamId ?? '',
        keyId: credentials.apple.keyId ?? '',
        privateKey: credentials.apple.privateKey ?? '',
      }),
      authorizeURL: 'https://appleid.apple.com/auth/authorize',
      exchangeURL: 'https://appleid.apple.com/auth/token',
      scope: 'name email',
      additionalParams: {
        response_mode: 'form_post',
      },
    },
  }
}

export const newClient = async (
  credentials: Record<string, ProviderCredentials>,
): Promise<{
  client: OAuth2Client
}> => {
  const axiosInstance = axios.create({})
  const providers = buildProviders(credentials)

  const telegramCustomHandler = buildTelegramOAuth(providers.telegram)
  const appleCustomHandler = buildAppleOAuth({
    providerConfig: providers.apple,
    axiosInstance,
  })

  const customHandlers = { telegram: telegramCustomHandler, apple: appleCustomHandler }

  const getConsentURL = buildGetConsentURL({ providers, customHandlers })
  const getTokens = buildGetTokens({
    axiosInstance,
    providers,
    customHandlers,
  })
  const getUserInfo = buildGetUserInfo({
    axiosInstance,
    providers,
    customHandlers,
  })

  return {
    client: {
      getConsentURL,
      getTokens,
      getUserInfo,
    },
  }
}

export * from './types'
