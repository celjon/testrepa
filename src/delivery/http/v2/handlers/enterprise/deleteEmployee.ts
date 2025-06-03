import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'enterprise'>
export type DeleteEmployee = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteEmployee = ({ enterprise }: Params): DeleteEmployee => {
  return async (req, res) => {
    const employee = await enterprise.deleteEmployee({
      employeeId: req.params.employeeId,
      userId: req.user?.id
    })

    return res.status(200).json(employee)
  }
}
