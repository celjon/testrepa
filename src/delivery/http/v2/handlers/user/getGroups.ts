import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'user' | 'group'>
export type GetGroups = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetGroups = ({ group }: Params): GetGroups => {
  return async (req, res) => {
    const groups = await group.list({
      userId: req.user?.id,
      page: req.query.page as any as number
    })

    return res.status(200).json(groups)
  }
}
