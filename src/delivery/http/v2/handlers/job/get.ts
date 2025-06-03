import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'job'>

export type Get = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGet =
  ({ job }: Params): Get =>
  async (req, res) => {
    const data = await job.get({
      jobId: req.params.id,
      userId: req.user.id
    })

    return res.status(200).json(data)
  }
