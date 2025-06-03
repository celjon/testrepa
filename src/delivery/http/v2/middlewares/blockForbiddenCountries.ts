import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import { Adapter } from '@/adapter'
import { logger } from '@/lib/logger'
import { getErrorString, getIPFromRequest } from '@/lib'

type Params = Pick<Adapter, 'geoGateway'>

export type BlockForbiddenCountriesMiddleware = (blockedCountries: string[]) => (req: Request, res: Response, next: NextFunction) => void

export const buildBlockForbiddenCountries = ({ geoGateway }: Params): BlockForbiddenCountriesMiddleware => {
  return (blockedCountries) => {
    return async (req, res, next) => {
      const currentIP = getIPFromRequest(req)
      try {
        const ipMetadata = await geoGateway.determineLocation(currentIP)

        if (ipMetadata && blockedCountries.includes(ipMetadata.country?.iso_code ?? ipMetadata.registered_country?.iso_code ?? '')) {
          return res.status(httpStatus.FORBIDDEN).json({
            error: {
              message: 'FORBIDDEN'
            }
          })
        }
        next()
      } catch (e) {
        logger.error({
          location: 'middleware.blockForbiddenCountries',
          message: `Failed to determine geo location: ${getErrorString(e)}`,
          ip: currentIP
        })
        next()
      }
    }
  }
}
