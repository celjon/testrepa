import { AdapterParams } from '@/adapter/types'
import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { InvalidDataError } from '@/domain/errors'

type Params = Pick<AdapterParams, 'oauth'>

export type VerifyOAuth = (params: {
  provider: string
  code: string
  device_id: string
  code_verifier?: string
  redirect_uri: string
  yandexMetricClientId: string | null
  yandexMetricYclid: string | null
}) => Promise<
  | {
      email?: string
      tg_id?: string
      given_name?: string
      picture?: string
    }
  | never
>

export const buildVerifyOAuth = ({ oauth }: Params): VerifyOAuth => {
  return async ({ provider, code, device_id, code_verifier, redirect_uri }) => {
    try {
      const token = await oauth.client.getAccessToken({
        code,
        device_id,
        provider,
        code_verifier,
        redirect_uri
      })

      const userInfo = await oauth.client.getUserInfo({
        access_token: token.access_token,
        provider
      })

      return userInfo
    } catch (e) {
      logger.error({
        location: 'verifyOAuth',
        message: getErrorString(e)
      })

      throw new InvalidDataError({
        code: 'TOKEN_INVALID'
      })
    }
  }
}
