import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleExpertJobHistory'>

export type GetSEOArticleExpertJobHistory = (req: AuthRequest, res: Response) => Promise<void>

export const buildGetSEOArticleExpertJobHistory = ({
  seoArticleExpertJobHistory,
}: Params): GetSEOArticleExpertJobHistory => {
  return async (req, res) => {
    const result = await seoArticleExpertJobHistory.getSEOArticleExpertJobHistory({
      id: req.params.seoArticleExpertJobHistoryId,
    })

    res.status(200).json(result)
  }
}
