import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { InvalidDataError } from '@/domain/errors'

type Params = Pick<DeliveryParams, 'model'>

export type UpdateAccountQueue = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateAccountQueue = ({ model }: Params): UpdateAccountQueue => {
  return async (req, res) => {
    const { intervalTimeStart, intervalTimeEnd } = req.body

    if (intervalTimeStart && intervalTimeEnd) {
      if (intervalTimeStart.split(':').length !== 3 || intervalTimeEnd.split(':').length !== 3) {
        throw new InvalidDataError({
          code: 'INVALID_TIME_FORMAT',
          message: 'Invalid time format. Expected HH:mm:ss',
        })
      }
    }

    const account = await model.updateAccountQueue({
      ...req.body,
      id: req.params.id,
    })

    return res.status(200).json(account)
  }
}
