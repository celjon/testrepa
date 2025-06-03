import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '@/delivery/http/v2/handlers/types'

type Params = Pick<DeliveryParams, 'message'>
export type CreateReport = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreateReport = ({ message }: Params): CreateReport => {
  return async (req, res) => {
    const message_id = req.body.message_id
    const description = 'Bad message'
    const user_id = req.user?.id

    const report = await message.report.create({ user_id, message_id, description })

    return res.status(200).json(report)
  }
}
