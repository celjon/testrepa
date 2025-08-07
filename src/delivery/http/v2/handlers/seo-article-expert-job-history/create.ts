import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleExpertJobHistory'>

export type CreateSEOArticleExpertJobHistory = (req: AuthRequest, res: Response) => Promise<void>

export const buildCreateSEOArticleExpertJobHistory = ({
  seoArticleExpertJobHistory,
}: Params): CreateSEOArticleExpertJobHistory => {
  return async (req, res) => {
    const result = await seoArticleExpertJobHistory.createSEOArticleExpertJobHistory({
      post: req.body.post,
      from_date: new Date(req.body.from_date),
      to_date: req.body.to_date ? new Date(req.body.to_date) : null,
      company: req.body.company,
      city: req.body.city,
      duties: req.body.duties,
      achievements: req.body.achievements,
      description: req.body.description,
      seo_expert_id: req.body.seo_expert_id,
    })

    res.status(200).json(result)
  }
}
