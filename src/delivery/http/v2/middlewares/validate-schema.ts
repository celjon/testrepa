import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'

export type ValidateSchemaMiddleware = (req: Request, res: Response, next: NextFunction) => void

export const buildValidateSchema = (): ValidateSchemaMiddleware => {
  return (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      })
    }
    next()
  }
}
