import { Request, Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'auth'>

export type TelegramAuthorize = (req: Request, res: Response) => Promise<Response>
export const buildTelegramAuthorize = ({ auth }: Params): TelegramAuthorize => {
  return async (req, res) => {
    const botSecretKey = req.header('botsecretkey')
    const tgId = req.body.tg_id
    const name = req.body.name
    const id = req.body.id
    const invitedBy = req.body.invitedBy
    const yandexMetricClientId = req.body.yandexMetricClientId ?? null
    const yandexMetricYclid = req.body.yandexMetricYclid ?? null
    const data = await auth.telegram({
      tgId,
      name,
      id,
      botSecretKey,
      invitedBy,
      yandexMetricClientId,
      yandexMetricYclid
    })
    return res.status(200).json(data)
  }
}
