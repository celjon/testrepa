import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'enterprise'>
export type ListEmployeeGroup = (req: AuthRequest, res: Response) => Promise<Response>

export const buildListEmployeeGroup = ({ enterprise }: Params): ListEmployeeGroup => {
  return async (req, res) => {
    const employeeGroups = await enterprise.listEmployeeGroup({
      userId: req.user?.id,
      quantity: req.body.quantity,
      page: req.body.page,
    })

    return res.status(200).json(employeeGroups)
  }
}
