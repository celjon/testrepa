import { Request, Response } from 'express'
import ipaddr from 'ipaddr.js'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'geoGateway'>

export type GetCountry = (req: Request, res: Response) => Promise<Response>

export const buildGetCountry = ({ geoGateway }: Params): GetCountry => {
  return async (req, res) => {
    const ip = req.params.ip
    try {
      const currentIp = ipaddr.process(ip).toString()

      const ipMetadata = await geoGateway.determineLocation(currentIp)

      if (!ipMetadata) {
        return res.status(200).json({
          countryCode: '',
        })
      }

      return res.status(200).json({
        countryCode: ipMetadata.country?.iso_code ?? ipMetadata.registered_country?.iso_code ?? '',
        ipMetadata,
      })
    } catch (e) {
      logger.error({
        location: 'regionLock.getCountry',
        message: `Cannot determine country ${getErrorString(e)} for ip: ${ip}`,
      })
      return res.status(200).json({
        countryCode: '',
      })
    }
  }
}
