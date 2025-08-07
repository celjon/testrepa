import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'article'>
export type ListSEOArticlesByCategorySlug = (req: AuthRequest, res: Response) => Promise<Response>

export const buildListSEOArticlesByCategorySlug = ({
  article,
}: Params): ListSEOArticlesByCategorySlug => {
  return async (req, res) => {
    const articles = await article.listSEOArticlesByCategorySlug({
      slug: req.params.slug,
      page: Number(req.query.page ?? 1),
      quantity: Number(req.query.quantity ?? 1),
    })

    return res.status(200).json(articles)
  }
}
