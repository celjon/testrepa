import { NextFunction, Request, Response } from 'express'
import { logger } from '@/lib/logger'
import { config } from '@/config'

export type LoggerMiddleware = (req: Request, res: Response, next: NextFunction) => void

export const buildLoggerMiddleware = (): LoggerMiddleware => {
  return (req, res, next) => {
    const url = req.url

    if (!config.http.logs) {
      return next()
    }

    logger.info({
      message: `[HTTP Request] ${req.method} ${url} from ${req.ip}`,
      meta: {
        date: new Date()
      }
    })

    res.on('close', () => {
      logger.log({
        level: 'info',
        message: `[HTTP Response] ${req.method} ${url} ${res.statusCode}`,
        meta: {
          date: new Date()
        }
      })
    })

    return next()
  }
}
