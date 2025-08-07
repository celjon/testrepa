import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'article'>
export type ListSEOArticlesByCategoryAndTopicSlug = (
  req: AuthRequest,
  res: Response,
) => Promise<Response>

export const buildListSEOArticlesByCategoryAndTopicSlug = ({
  article,
}: Params): ListSEOArticlesByCategoryAndTopicSlug => {
  return async (req, res) => {
    const articles = await article.listSEOArticlesByTopicSlug({
      categorySlug: req.params.categorySlug,
      topicSlug: req.params.topicSlug,
      page: Number(req.query.page ?? 1),
      quantity: Number(req.query.quantity ?? 1),
    })

    return res.status(200).json(articles)
  }
}
