import { Response } from 'express'
import { Platform } from '@prisma/client'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'model'>

export type List = (req: AuthRequest, res: Response) => Promise<Response>

export const buildList = ({ model }: Params): List => {
  return async (req, res) => {
    const platform = (typeof req.query?.platform === 'string' ? req.query.platform : req.body?.platform) ?? Platform.WEB
    const models = await model.list({
      userId: req.user?.id,
      parentId: req.query.parentId?.toString() ?? null,
      listChildren: req.query.children === '1',
      platform: platform?.toUpperCase(),
    })

    return res.status(200).json(models)
  }
}
