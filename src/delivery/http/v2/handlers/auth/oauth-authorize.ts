import { Request, Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { getLocale, getIPFromRequest } from '@/lib'

type Params = Pick<DeliveryParams, 'auth'>

export type OAuthAuthorize = (req: Request, res: Response) => Promise<Response>

export const buildOAuthAuthorize = ({ auth }: Params): OAuthAuthorize => {
  return async (req, res) => {
    const locale = getLocale(req.headers['accept-language'])

    const data = await auth.oauthAuthorize({
      provider: req.body.provider,
      code: req.body.code,
      device_id: req.body.device_id,
      code_verifier: req.body.code_verifier,
      redirect_uri: req.body.redirect_uri,
      fingerprint: req.body.fingerprint,
      invitedBy: req.query.invitedBy as string | undefined,
      email: req.body.email,
      name: req.body.name,
      ip: getIPFromRequest(req),
      yandexMetricClientId: req.body.yandexMetricClientId,
      yandexMetricYclid: req.body.yandexMetricYclid,
      user_agent: req.headers['user-agent'] ?? null,
      metadata: {
        locale,
      },
      isAdminPanel: req.query.isAdminPanel === 'true',
      appPlatform: req.body.appPlatform,
      identityToken: req.body.identityToken,
    })

    return res.status(200).json(data)
  }
}
