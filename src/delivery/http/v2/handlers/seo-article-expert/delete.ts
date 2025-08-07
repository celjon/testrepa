import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleExpert'>

export type DeleteSEOArticleExpert = (req: AuthRequest, res: Response) => Promise<void>

export const buildDeleteSEOArticleExpert = ({
  seoArticleExpert,
}: Params): DeleteSEOArticleExpert => {
  return async (req, res) => {
    const result = await seoArticleExpert.deleteSEOArticleExpert({
      id: req.params.seoExpertId,
    })

    res.status(200).json(result)
  }
}
