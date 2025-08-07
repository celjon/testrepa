import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'seoArticleCategory'>
export type ListSEOArticlesCategory = (req: AuthRequest, res: Response) => Promise<Response>

export const buildListSEOArticleCategory = ({
  seoArticleCategory,
}: Params): ListSEOArticlesCategory => {
  return async (req, res) => {
    const categories = await seoArticleCategory.listSEOArticleCategory({
      page: Number(req.query.page ?? 1),
      quantity: Number(req.query.quantity ?? 1),
    })

    return res.status(200).json(categories)
  }
}
