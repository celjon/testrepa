import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'article'>

export type FindBySlug = (req: AuthRequest, res: Response) => Promise<void>

export const buildFindBySlug = ({ article }: Params): FindBySlug => {
  return async (req, res) => {
    const result = await article.findBySlug({
      slug: req.params.slug,
    })
    res.status(200).json(result)
  }
}
