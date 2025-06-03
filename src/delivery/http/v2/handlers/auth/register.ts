import { Request, Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { getLocale, getIPFromRequest } from '@/lib'

type Params = Pick<DeliveryParams, 'auth'>

export type Register = (req: Request, res: Response) => Promise<Response>
export const buildRegister = ({ auth }: Params): Register => {
  return async (req, res) => {
    const locale = getLocale(req.headers['accept-language'])

    const data = await auth.register({
      email: req.body.email?.toLowerCase(),
      password: req.body.password,
      receiveEmails: req.body.receiveEmails,
      invitedBy: req.query.invitedBy as string | undefined,
      fingerprint: req.body.fingerprint as string | undefined,
      yandexMetricClientId: req.body.yandexMetricClientId ?? null,
      yandexMetricYclid: req.body.yandexMetricYclid ?? null,
      ip: getIPFromRequest(req),
      metadata: {
        locale
      }
    })

    return res.status(200).json(data)
  }
}
