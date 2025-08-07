import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'openai'>
export type ImagesCreate = (req: AuthRequest, res: Response) => void

export const buildImagesCreate = ({ openai }: Params): ImagesCreate => {
  return async (req, res) => {
    const data = await openai.images.create({
      userId: req.user?.id,
      params: req.body,
      developerKeyId: req.user?.developerKeyId,
    })

    return res.status(200).json(data)
  }
}
