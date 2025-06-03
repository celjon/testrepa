import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'article'>

export type GetArticle = (req: AuthRequest, res: Response) => Promise<void>

export const buildGetArticle = ({ article }: Params): GetArticle => {
  return async (req, res) => {
    const result = await article.get({
      userId: req.user.id,
      articleId: req.params.articleId
    })

    res.status(200).json(result)
  }
}
