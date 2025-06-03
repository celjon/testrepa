import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleCategory'>

export type UpdateSEOArticleCategory = (req: AuthRequest, res: Response) => Promise<void>

export const buildUpdateSEOArticleCategory = ({ seoArticleCategory }: Params): UpdateSEOArticleCategory => {
  return async (req, res) => {
    const result = await seoArticleCategory.updateSEOArticleCategory({
      id: req.params.seoArticleCategoryId,
      name: req.body.name
    })

    res.status(200).json(result)
  }
}
