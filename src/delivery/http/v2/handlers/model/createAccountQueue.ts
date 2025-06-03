import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { InvalidDataError } from '@/domain/errors'

type Params = Pick<DeliveryParams, 'model'>

export type CreateAccountQueue = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreateAccountQueue = ({ model }: Params): CreateAccountQueue => {
  return async (req, res) => {
    const { intervalTimeStart, intervalTimeEnd } = req.body

    if (intervalTimeStart && intervalTimeEnd) {
      if (intervalTimeStart.split(':').length !== 3 || intervalTimeEnd.split(':').length !== 3) {
        throw new InvalidDataError({
          code: 'INVALID_TIME_FORMAT',
          message: 'Invalid time format. Expected HH:mm:ss'
        })
      }
    }

    const account = await model.createAccountQueue({
      ...req.body
    })

    return res.status(200).json(account)
  }
}
