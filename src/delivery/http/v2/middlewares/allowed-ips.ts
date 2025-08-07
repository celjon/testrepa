import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import { getIPFromRequest } from '@/lib'

export type allowedIpsMiddleware = (
  ips: Array<string>,
) => (req: Request, res: Response, next: NextFunction) => void

export const buildAllowedIps = (): allowedIpsMiddleware => {
  return (ips) => {
    return (req, res, next) => {
      const ip = getIPFromRequest(req)

      if (!ips.includes(ip)) {
        return res.status(httpStatus.FORBIDDEN).json({
          error: {
            message: 'FORBIDDEN',
          },
        })
      }
      next()
    }
  }
}
