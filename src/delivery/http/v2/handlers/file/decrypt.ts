import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'file'>

export type Decrypt = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDecrypt = ({ file }: Params): Decrypt => {
  return async (req, res) => {
    const data = await file.decrypt({
      userId: req.user.id,
      keyEncryptionKey: req.user.keyEncryptionKey,
      fileId: req.params.fileId
    })

    return res.status(200).json(data)
  }
}
