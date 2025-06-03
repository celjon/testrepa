import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleProofreading'>

export type DeleteSEOArticleProofreading = (req: AuthRequest, res: Response) => Promise<void>

export const buildDeleteSEOArticleProofreading = ({ seoArticleProofreading }: Params): DeleteSEOArticleProofreading => {
  return async (req, res) => {
    const result = await seoArticleProofreading.deleteSEOArticleProofreading({
      id: req.params.seoArticleProofreadingId
    })

    res.status(200).json(result)
  }
}
