import { AuthRequest } from '../../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'user'>
export type ListUsers = (req: AuthRequest, res: Response) => Promise<Response>

export const buildListUsers = ({ user }: Params): ListUsers => {
  return async (req, res) => {
    const users = await user.list({
      search: req.query.search as string,
      page: req.query.page as any,
      userId: req.user?.id,
    })

    return res.status(200).json(users)
  }
}
