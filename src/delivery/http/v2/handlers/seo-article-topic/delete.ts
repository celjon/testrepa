import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleTopic'>

export type DeleteSEOArticleTopic = (req: AuthRequest, res: Response) => Promise<void>

export const buildDeleteSEOArticleTopic = ({ seoArticleTopic }: Params): DeleteSEOArticleTopic => {
  return async (req, res) => {
    const result = await seoArticleTopic.deleteSEOArticleTopic({
      id: req.params.seoArticleTopicId
    })

    res.status(200).json(result)
  }
}
