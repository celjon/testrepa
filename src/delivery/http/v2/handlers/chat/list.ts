import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'chat'>
export type List = (req: AuthRequest, res: Response) => Promise<Response>

export const buildList = ({ chat }: Params): List => {
  return async (req, res) => {
    const data = await chat.list({
      userId: req.user?.id,
      page: req.query.page as any as number,
      groupId: req.query.groupId as any as string,
      groupIds: req.query.groupIds as any as string[],
      search: req.query.search as any as string,
      sort: req.query?.sort as any as string,
      sortDirection: req.query?.sortDirection as any as string,
    })

    return res.status(200).json(data)
  }
}
