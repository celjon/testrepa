import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleExpert'>

export type GetSEOArticleExpert = (req: AuthRequest, res: Response) => Promise<void>

export const buildGetSEOArticleExpert = ({ seoArticleExpert }: Params): GetSEOArticleExpert => {
  return async (req, res) => {
    const result = await seoArticleExpert.getSEOArticleExpert({
      id: req.params.seoExpertId
    })

    res.status(200).json(result)
  }
}
