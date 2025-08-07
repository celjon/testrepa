import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'group'>
export type List = (req: AuthRequest, res: Response) => Promise<Response>

export const buildList = ({ group }: Params): List => {
  return async (req, res) => {
    const groups = await group.list({
      userId: req.user?.id,
      page: req.query.page as any as number,
      search: req.query.search as any as string,
      sort: req.query?.sort as any as string,
      sortDirection: req.query.sortDirection as any as string,
    })

    return res.status(200).json(groups)
  }
}
