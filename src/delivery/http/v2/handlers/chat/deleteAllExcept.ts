import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'chat'>

export type DeleteAllExcept = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteAllExcept = ({ chat }: Params): DeleteAllExcept => {
  return async (req, res) => {
    const data = await chat.deleteAllExcept({
      userId: req.user?.id,
      idsToKeep: req.body.idsToKeep,
      groupIdsToKeep: req.body.groupIdsToKeep
    })

    return res.status(200).json(data)
  }
}
