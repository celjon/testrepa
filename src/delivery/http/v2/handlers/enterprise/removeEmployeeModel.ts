import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'enterprise'>
export type RemoveEmployeeModel = (req: AuthRequest, res: Response) => Promise<Response>

export const buildRemoveEmployeeModel = ({ enterprise }: Params): RemoveEmployeeModel => {
  return async (req, res) => {
    await enterprise.removeEmployeeModel({
      employeeId: req.params.employeeId,
      userId: req.user?.id,
      enterpriseId: req.params.enterpriseId,
      modelId: req.body.modelId
    })

    return res.status(200).end()
  }
}
