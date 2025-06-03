import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'article'>

export type DeleteArticle = (req: AuthRequest, res: Response) => Promise<void>

export const buildDeleteArticle = ({ article }: Params): DeleteArticle => {
  return async (req, res) => {
    const result = await article.deleteArticle({
      id: req.params.articleId
    })

    res.status(200).json(result)
  }
}
