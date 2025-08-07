import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleCategory'>

export type DeleteSEOArticleCategory = (req: AuthRequest, res: Response) => Promise<void>

export const buildDeleteSEOArticleCategory = ({
  seoArticleCategory,
}: Params): DeleteSEOArticleCategory => {
  return async (req, res) => {
    const result = await seoArticleCategory.deleteSEOArticleCategory({
      id: req.params.seoArticleCategoryId,
    })

    res.status(200).json(result)
  }
}
