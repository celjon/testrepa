import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type DeleteAccountQueue = (req: AuthRequest, res: Response) => Promise<Response>

export const buildDeleteAccountQueue = ({ model }: Params): DeleteAccountQueue => {
  return async (req, res) => {
    await model.deleteAccountQueue({
      id: req.params.id
    })

    return res.status(200).send()
  }
}
