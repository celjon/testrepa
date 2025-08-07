import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'file'>
export type GeneratePresignedUrl = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGeneratePresignedUrl = ({ file }: Params): GeneratePresignedUrl => {
  return async (req, res) => {
    const data = await file.generatePresignedUrl({
      ext: req.params.ext,
    })

    return res.status(200).json(data)
  }
}
