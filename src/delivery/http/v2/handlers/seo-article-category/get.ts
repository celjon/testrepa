import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleCategory'>

export type GetSEOArticleCategory = (req: AuthRequest, res: Response) => Promise<void>

export const buildGetSEOArticleCategory = ({
  seoArticleCategory,
}: Params): GetSEOArticleCategory => {
  return async (req, res) => {
    const result = await seoArticleCategory.getSEOArticleCategory({
      id: req.params.seoArticleCategoryId,
    })

    res.status(200).json(result)
  }
}
