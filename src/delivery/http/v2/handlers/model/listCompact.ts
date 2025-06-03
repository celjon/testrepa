import { Response } from 'express'
import { Platform } from '@prisma/client'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'model'>

export type ListCompact = (req: AuthRequest, res: Response) => Promise<Response>

export const buildListCompact = ({ model }: Params): ListCompact => {
  return async (req, res) => {
    const platform = (typeof req.query?.platform === 'string' ? req.query.platform : req.body?.platform) ?? Platform.WEB
    const models = await model.listCompact({
      userId: req.user?.id,
      platform: platform?.toUpperCase()
    })

    return res.status(200).json(models)
  }
}
