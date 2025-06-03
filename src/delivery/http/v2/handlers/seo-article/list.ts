import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'article'>
export type ListSEOArticles = (req: AuthRequest, res: Response) => Promise<Response>

export const buildListSEOArticles = ({ article }: Params): ListSEOArticles => {
  return async (req, res) => {
    const articles = await article.listSEOArticles({
      search: req.query.search as string,
      page: Number(req.query.page ?? 1),
      quantity: Number(req.query.quantity ?? 1)
    })

    return res.status(200).json(articles)
  }
}
