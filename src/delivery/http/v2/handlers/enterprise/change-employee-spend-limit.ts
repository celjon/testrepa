import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'enterprise'>
export type ChangeEmployeeSpendLimit = (req: AuthRequest, res: Response) => Promise<Response>

export const buildChangeEmployeeSpendLimit = ({ enterprise }: Params): ChangeEmployeeSpendLimit => {
  return async (req, res) => {
    const result = await enterprise.changeEmployeeSpendLimit({
      employeeId: req.params.employeeId,
      spend_limit_on_month: parseInt(req.body.spend_limit_on_month),
      userId: req.user?.id,
    })

    return res.status(200).json(result)
  }
}
