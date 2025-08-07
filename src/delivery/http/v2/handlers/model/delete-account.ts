import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type DeleteAccount = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteAccount = ({ model }: Params): DeleteAccount => {
  return async (req, res) => {
    await model.deleteAccount({
      id: req.params.id,
    })

    return res.status(200).send()
  }
}
