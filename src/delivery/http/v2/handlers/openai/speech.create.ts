import mime from 'mime-types'
import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'openai'>
export type SpeechCreate = (req: AuthRequest, res: Response) => void

export const buildSpeechCreate = ({ openai }: Params): SpeechCreate => {
  return async (req, res) => {
    const data = await openai.speech.create({
      userId: req.user.id,
      params: req.body,
      developerKeyId: req.user?.developerKeyId,
    })

    const contentType =
      typeof req.body.response_format === 'string' && mime.lookup(req.body.response_format)

    if (contentType) {
      res.setHeader('Content-Type', contentType)
    }

    return res.status(200).send(data)
  }
}
