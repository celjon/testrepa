import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'enterprise'>
export type ChangeEmployeeBalance = (req: AuthRequest, res: Response) => Promise<Response>

export const buildChangeEmployeeBalance = ({ enterprise }: Params): ChangeEmployeeBalance => {
  return async (req, res) => {
    const result = await enterprise.changeEmployeeBalance({
      employeeId: req.params.employeeId,
      balanceDelta: parseInt(req.body.balanceDelta),
      userId: req.user?.id
    })

    return res.status(200).json(result)
  }
}
