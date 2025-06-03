import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleTopic'>

export type CreateSEOArticleTopic = (req: AuthRequest, res: Response) => Promise<void>

export const buildCreateSEOArticleTopic = ({ seoArticleTopic }: Params): CreateSEOArticleTopic => {
  return async (req, res) => {
    const result = await seoArticleTopic.createSEOArticleTopic({
      name: req.body.name,
      article_id: req.body.article_id,
      category_id: req.body.category_id
    })

    res.status(200).json(result)
  }
}
