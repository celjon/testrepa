import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'enterprise'>
export type UpdateEmployeeGroups = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateEmployeeGroups = ({ enterprise }: Params): UpdateEmployeeGroups => {
  return async (req, res) => {
    const employeeGroup = await enterprise.updateEmployeeGroups({
      groups: req.body.groups,
      userId: req.user?.id,
    })

    return res.status(200).json(employeeGroup)
  }
}
