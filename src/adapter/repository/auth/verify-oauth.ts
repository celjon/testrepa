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
  email?: string
  name?: string
  appPlatform?: 'ios-app-store'
  identityToken?: string
}) => Promise<
  | {
      email?: string
      tg_id?: string
      given_name?: string
      picture?: string
      external_id: string | null
    }
  | never
>

export const buildVerifyOAuth = ({ oauth }: Params): VerifyOAuth => {
  return async ({
    provider,
    code,
    device_id,
    code_verifier,
    redirect_uri,
    email,
    name,
    appPlatform,
    identityToken,
  }) => {
    try {
      const tokens = await oauth.client.getTokens({
        code,
        device_id,
        provider,
        code_verifier,
        redirect_uri,
        appPlatform,
        identityToken,
      })

      const userInfo = await oauth.client.getUserInfo({
        access_token: tokens.access_token,
        id_token: tokens.id_token,
        provider,
        data:
          email || name
            ? {
                email,
                name,
              }
            : null,
        appPlatform,
      })

      return userInfo
    } catch (e) {
      logger.error({
        location: 'verifyOAuth',
        message: getErrorString(e),
      })

      throw new InvalidDataError({
        code: 'TOKEN_INVALID',
      })
    }
  }
}
