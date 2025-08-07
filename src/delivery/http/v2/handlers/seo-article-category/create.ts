import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleCategory'>

export type CreateSEOArticleCategory = (req: AuthRequest, res: Response) => Promise<void>

export const buildCreateSEOArticleCategory = ({
  seoArticleCategory,
}: Params): CreateSEOArticleCategory => {
  return async (req, res) => {
    const result = await seoArticleCategory.createSEOArticleCategory({
      name: req.body.name,
    })

    res.status(200).json(result)
  }
}
