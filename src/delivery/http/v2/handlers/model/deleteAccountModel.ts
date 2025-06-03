import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type DeleteAccountModel = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteAccountModel = ({ model }: Params): DeleteAccountModel => {
  return async (req, res) => {
    await model.deleteAccountModel({
      id: req.params.id
    })

    return res.status(200).send()
  }
}
