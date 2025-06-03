import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleProofreading'>

export type GetSEOArticleProofreading = (req: AuthRequest, res: Response) => Promise<void>

export const buildGetSEOArticleProofreading = ({ seoArticleProofreading }: Params): GetSEOArticleProofreading => {
  return async (req, res) => {
    const result = await seoArticleProofreading.getSEOArticleProofreading({
      id: req.params.seoArticleProofreadingId
    })

    res.status(200).json(result)
  }
}
