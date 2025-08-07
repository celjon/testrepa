import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'enterprise'>
export type ListEnterprises = (req: AuthRequest, res: Response) => Promise<Response>

export const buildListEnterprises = ({ enterprise }: Params): ListEnterprises => {
  return async (req, res) => {
    const enterprises = await enterprise.list({
      search: req.query.search as string,
      page: req.query.page as any,
      userId: req.user?.id,
    })

    return res.status(200).json(enterprises)
  }
}
