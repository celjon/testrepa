import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'article'>

export type UpdateArticle = (req: AuthRequest, res: Response) => Promise<void>

export const buildUpdateArticle = ({ article }: Params): UpdateArticle => {
  return async (req, res) => {
    const result = await article.update({
      userId: req.user.id,
      id: req.params.articleId,
      content: req.body.content,
      published_at: req.body.published_at,
    })

    res.status(200).json(result)
  }
}
