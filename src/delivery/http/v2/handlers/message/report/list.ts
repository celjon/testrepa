import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '@/delivery/http/v2/handlers/types'

type Params = Pick<DeliveryParams, 'message'>
export type ListReport = (req: AuthRequest, res: Response) => Promise<Response>

export const buildListReport = ({ message }: Params): ListReport => {
  return async (req, res) => {
    const chat_id = req.body.chat_id

    const report = await message.report.list(chat_id)

    return res.status(200).json(report)
  }
}
