import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type Parse = (req: AuthRequest, res: Response) => Promise<Response>

export const buildParse = ({ model }: Params): Parse => {
  return async (req, res) => {
    await model.parse()

    return res.status(200).send()
  }
}
