import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'promptQueuesRepository'>
export type CancelPromptQueue = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCancelPromptQueue =
  ({ promptQueuesRepository }: Params): CancelPromptQueue =>
  async (req, res) => {
    const userId = req.user!.id
    const queueId = req.body.queueId as string
    const wasCancelled = await promptQueuesRepository.cancelPromptQueue({ userId, queueId })
    if (!wasCancelled) {
      return res.status(404).json({ message: 'Queue was not found or has already been completed' })
    }
    return res.status(200).json({ message: 'Queue successful stoped', queueId })
  }
