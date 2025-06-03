import { DeliveryParams } from '@/delivery/types'
import { InvalidDataError, NotFoundError } from '@/domain/errors'
import { getIPFromRequest } from '@/lib'
import { Request, Response } from 'express'

type Params = Pick<DeliveryParams, 'geo'>

export type Get = (req: Request, res: Response) => Promise<Response>

export const buildGet = ({ geo }: Params): Get => {
  return async (req, res) => {
    const ip = getIPFromRequest(req)

    if (!ip)
      throw new InvalidDataError({
        code: 'IP_NOT_TRANSFERRED',
        message: 'IP is missing in request'
      })

    const location = await geo.get({ ip })

    if (!location)
      throw new NotFoundError({
        code: 'COUNTRY_NOT_FOUND',
        message: 'country not found in db'
      })

    return res.status(200).json(location)
  }
}
