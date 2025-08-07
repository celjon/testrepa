import { NextFunction, Request, Response } from 'express'
import { logger } from '@/lib/logger'
import { HttpError } from '../errors'

export type ErrorHandlerMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => void

export const buildErrorHandler = (): ErrorHandlerMiddleware => {
  // Do not remove last argument
  // Express error handling-middleware must have 4 arguments

  return (error, _, res, _1) => {
    const httpError = new HttpError(error)

    if (!httpError.isKnownError) {
      logger.error({
        location: 'middleware.errorHandler',
        message: error.stack || `${error.message}\nNo stack provided`,
      })
    }

    return res.status(httpError.statusCode).json({
      status: 'error',
      error: httpError.getError(),
    })
  }
}
