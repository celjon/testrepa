import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'enterprise'>
export type CreateEmployeeGroups = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreateEmployeeGroups = ({ enterprise }: Params): CreateEmployeeGroups => {
  return async (req, res) => {
    const employeeGroup = await enterprise.createEmployeeGroups({
      groups: req.body.groups,
      userId: req.user?.id,
    })

    return res.status(200).json(employeeGroup)
  }
}
