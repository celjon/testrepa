import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '@/delivery/http/v2/handlers/types'

type Params = Pick<DeliveryParams, 'message'>
export type DeleteReport = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteReport = ({ message }: Params): DeleteReport => {
  return async (req, res) => {
    const message_id = req.body.message_id

    const report = await message.report.delete(message_id)

    return res.status(200).json(report)
  }
}
