import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'auth'>

export type UpdateYandexMetric = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateYandexMetric = ({ auth }: Params): UpdateYandexMetric => {
  return async (req, res) => {
    const updatedUser = await auth.updateYandexMetric({
      userId: req.user?.id,
      yandexMetricClientId: req.body.yandexMetricClientId,
      yandexMetricYclid: req.body.yandexMetricYclid
    })

    return res.status(200).json(updatedUser)
  }
}
