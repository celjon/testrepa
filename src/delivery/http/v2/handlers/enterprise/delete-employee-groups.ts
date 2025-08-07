import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'enterprise'>
export type DeleteEmployeeGroups = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteEmployeeGroups = ({ enterprise }: Params): DeleteEmployeeGroups => {
  return async (req, res) => {
    const employeeGroups = await enterprise.deleteEmployeeGroups({
      employeeGroupIds: req.body.employeeGroupIds,
      userId: req.user?.id,
    })

    return res.status(200).json(employeeGroups)
  }
}
