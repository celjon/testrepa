import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'openai'>
export type Embeddings = (req: AuthRequest, res: Response) => Promise<Response>

export const buildEmbeddings = ({ openai }: Params): Embeddings => {
  return async (req, res) => {
    const data = await openai.embeddings.create({
      userId: req.user?.id,
      params: req.body,
      developerKeyId: req.user?.developerKeyId,
    })

    return res.status(200).json(data)
  }
}
