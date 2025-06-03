import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'chat'>

export type UpdateSettings = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateSettings =
  ({ chat }: Params): UpdateSettings =>
  async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined

    const values = req.body.name
      ? {
          [req.body.name]: files ?? req.body.value
        }
      : req.body

    const data = await chat.updateSettings({
      userId: req.user.id,
      chatId: req.params.id,
      values
    })

    return res.status(200).json(data)
  }
