import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'plan'>
export type Buy = (req: AuthRequest, res: Response) => Promise<Response>

export const buildBuy = ({ plan }: Params): Buy => {
  return async (req, res) => {
    const paymentData = await plan.buy({
      userId: req.user?.id,
      planId: req.params.id,
      provider: req.body.provider as any,
      presentEmail: req.body.presentEmail,
      presentUserId: req.body.presentUserId,
      yandexMetricClientId: req.body.yandexMetricClientId,
      yandexMetricYclid: req.body.yandexMetricYclid,
    })
    return res.status(200).json(paymentData)
  }
}
