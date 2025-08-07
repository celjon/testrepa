import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleExpertJobHistory'>

export type DeleteSEOArticleExpertJobHistory = (req: AuthRequest, res: Response) => Promise<void>

export const buildDeleteSEOArticleExpertJobHistory = ({
  seoArticleExpertJobHistory,
}: Params): DeleteSEOArticleExpertJobHistory => {
  return async (req, res) => {
    const result = await seoArticleExpertJobHistory.deleteSEOArticleExpertJobHistory({
      id: req.params.seoArticleExpertJobHistoryId,
    })

    res.status(200).json(result)
  }
}
