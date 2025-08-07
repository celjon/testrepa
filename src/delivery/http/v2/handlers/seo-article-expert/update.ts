import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleExpert'>

export type UpdateSEOArticleExpert = (req: AuthRequest, res: Response) => Promise<void>

export const buildUpdateSEOArticleExpert = ({
  seoArticleExpert,
}: Params): UpdateSEOArticleExpert => {
  return async (req, res) => {
    const result = await seoArticleExpert.updateSEOArticleExpert({
      id: req.params.seoExpertId,
      name: req.body.name,
      email: req.body.email,
      telegram: req.body.telegram,
      bio: req.body.bio,
      city: req.body.city,
      country: req.body.country,
      education: req.body.education,
      qualification: req.body.qualification,
    })

    res.status(200).json(result)
  }
}
