import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleTopic'>

export type UpdateSEOArticleTopic = (req: AuthRequest, res: Response) => Promise<void>

export const buildUpdateSEOArticleTopic = ({ seoArticleTopic }: Params): UpdateSEOArticleTopic => {
  return async (req, res) => {
    const result = await seoArticleTopic.updateSEOArticleTopic({
      id: req.params.seoArticleTopicId,
      name: req.body.name,
      article_id: req.body.article_id,
      category_id: req.body.category_id,
    })

    res.status(200).json(result)
  }
}
