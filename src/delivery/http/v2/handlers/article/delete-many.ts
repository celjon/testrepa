import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { NotFoundError } from '@/domain/errors'

type Params = Pick<DeliveryParams, 'article'>

export type DeleteMany = (req: AuthRequest, res: Response) => Promise<void>

export const buildDeleteMany = ({ article }: Params): DeleteMany => {
  return async (req, res) => {
    const { articleIds } = req.body

    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      throw new NotFoundError({
        code: 'NO_ARTICLE_IDS_PROVIDED',
      })
    }
    const createdCount = await article.deleteMany({ ids: articleIds })
    res.status(201).json({ message: `${createdCount} articles successfully deleted.` })
  }
}
