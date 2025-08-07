import { Request, Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'auth'>

export type FingerprintAuthorize = (req: Request, res: Response) => Promise<Response>
export const buildFingerprintAuthorize = ({ auth }: Params): FingerprintAuthorize => {
  return async (req, res) => {
    const data = await auth.fingerprint({
      fingerprint: req.body.fingerprint,
      yandexMetricClientId: req.body.yandexMetricClientId,
      yandexMetricYclid: req.body.yandexMetricYclid,
    })
    return res.status(200).json(data)
  }
}
