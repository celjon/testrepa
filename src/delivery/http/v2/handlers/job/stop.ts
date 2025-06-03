import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'job'>

export type Stop = (req: AuthRequest, res: Response) => Promise<Response>

export const buildStop =
  ({ job }: Params): Stop =>
  async (req, res) => {
    const data = await job.stop({
      jobId: req.params.id,
      userId: req.user.id
    })

    return res.status(200).json(data)
  }
