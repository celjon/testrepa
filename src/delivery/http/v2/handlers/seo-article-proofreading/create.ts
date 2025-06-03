import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleProofreading'>

export type CreateSEOArticleProofreading = (req: AuthRequest, res: Response) => Promise<void>

export const buildCreateSEOArticleProofreading = ({ seoArticleProofreading }: Params): CreateSEOArticleProofreading => {
  return async (req, res) => {
    const result = await seoArticleProofreading.createSEOArticleProofreading({
      expert_id: req.body.expert_id,
      article_id: req.body.article_id
    })

    res.status(200).json(result)
  }
}
