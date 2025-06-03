import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'referralTemplate'>
export type List = (req: AuthRequest, res: Response) => Promise<Response>

export const buildList = ({ referralTemplate }: Params): List => {
  return async (req, res) => {
    const template = await referralTemplate.list({
      page: req.query.page as any,
      search: req.query.search as string,
      locale: req.query.locale as string
    })
    return res.status(200).json(template)
  }
}
