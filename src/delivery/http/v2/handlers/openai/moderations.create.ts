import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'openai'>
export type ModerationsCreate = (req: AuthRequest, res: Response) => void

export const buildModerationsCreate = ({ openai }: Params): ModerationsCreate => {
  return async (req, res) => {
    const data = await openai.moderations.create({
      userId: req.user?.id,
      params: req.body,
    })

    return res.status(200).json(data)
  }
}
