import { Axios, isAxiosError } from 'axios'
import { logger } from '@/lib/logger'
import { InvalidDataError } from '@/domain/errors'
import { CustomOAuthHandlers, OAuthProviders, UserInfoGetter } from './internal-types'
import { GetUserInfo } from './types'

export const buildGetUserInfo = ({
  axiosInstance,
  providers,
  customHandlers,
}: {
  axiosInstance: Axios
  providers: OAuthProviders
  customHandlers: CustomOAuthHandlers
}): GetUserInfo => {
  const userInfoGetters: Record<string, UserInfoGetter> = {
    google: getGoogleUserInfo,
    vk: getVKUserInfo,
    yandex: getYandexUserInfo,
  }

  return async ({ access_token, id_token, provider, data, appPlatform }) => {
    if (customHandlers[provider]?.getUserInfo) {
      const getUserInfo = customHandlers[provider].getUserInfo
      return getUserInfo({ access_token, id_token, provider, data, appPlatform })
    }

    if (!providers[provider] || !userInfoGetters[provider]) {
      throw new InvalidDataError({
        code: 'INVALID_OAUTH_PROVIDER',
      })
    }

    try {
      const providerConfig = providers[provider]
      const getUserInfo = userInfoGetters[provider]

      return await getUserInfo({
        axiosInstance,
        access_token,
        id_token,
        providerConfig,
        data,
      })
    } catch (e) {
      if (isAxiosError(e)) {
        logger.error('oauthClient.getUserInfo', {
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
        logger.error('oauthClient.getUserInfo', e)
      }

      throw new InvalidDataError({
        code: 'INVALID_CODE',
      })
    }
  }
}

const getGoogleUserInfo: UserInfoGetter = async ({ axiosInstance, access_token }) => {
  const response = await axiosInstance.get<any>('https://www.googleapis.com/oauth2/v3/userinfo', {
    params: {
      oauth_token: access_token,
    },
  })

  return {
    email: response.data.email,
    given_name: response.data.given_name,
    avatar: response.data.picture,
    external_id: null,
  }
}

type YandexUserInfo = {
  default_email: string
  first_name: string
  default_avatar_id: string
}

const getYandexUserInfo: UserInfoGetter = async ({
  axiosInstance,
  access_token,
  providerConfig,
}) => {
  const response = await axiosInstance.post<YandexUserInfo>(
    'https://login.yandex.ru/info',
    {},
    {
      params: {
        format: 'json',
        jwt_secret: providerConfig.clientSecret,
      },
      headers: {
        Authorization: `OAuth ${access_token}`,
      },
    },
  )

  return {
    email: response.data.default_email,
    given_name: response.data.first_name,
    avatar: `https://avatars.yandex.net/get-yapic/${response.data.default_avatar_id}/islands-retina-middle`,
    external_id: null,
  }
}

type VKUserInfo = {
  user: {
    user_id: number
    email?: string
    first_name?: string
    last_name?: string
    avatar?: string
  }
}

const getVKUserInfo: UserInfoGetter = async ({ axiosInstance, access_token, providerConfig }) => {
  const response = await axiosInstance.post<VKUserInfo>('https://id.vk.com/oauth2/user_info', {
    client_id: providerConfig.clientId,
    access_token,
  })

  return {
    email: response.data.user.email,
    given_name: response.data.user.first_name,
    avatar: response.data.user.avatar,
    external_id: response.data.user.user_id?.toString() ?? null,
  }
}
