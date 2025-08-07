import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'seoArticleExpert'>

export type FindBySlug = (req: AuthRequest, res: Response) => Promise<void>

export const buildFindBySlug = ({ seoArticleExpert }: Params): FindBySlug => {
  return async (req, res) => {
    const result = await seoArticleExpert.findBySlug({
      slug: req.params.slug as string,
    })
    res.status(200).json(result)
  }
}
