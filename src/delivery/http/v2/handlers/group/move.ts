import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'group'>

export type Move = (req: AuthRequest, res: Response) => Promise<Response>
export const buildMove =
  ({ group }: Params): Move =>
  async (req, res) => {
    const groups = await group.move({
      userId: req.user.id,
      groupId: req.body?.groupId,
      startGroupId: req.body?.startGroupId
    })

    return res.status(200).send(groups)
  }
