import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleTopic'>

export type GetSEOArticleTopic = (req: AuthRequest, res: Response) => Promise<void>

export const buildGetSEOArticleTopic = ({ seoArticleTopic }: Params): GetSEOArticleTopic => {
  return async (req, res) => {
    const result = await seoArticleTopic.getSEOArticleTopic({
      id: req.params.seoArticleTopicId
    })

    res.status(200).json(result)
  }
}
