import { Adapter } from '@/domain/types'
import { AuthRequiredMiddleware, buildAuthRequired } from './authRequired'
import { allowedIpsMiddleware, buildAllowedIps } from './allowedIps'
import { buildErrorHandler, ErrorHandlerMiddleware } from './errorHandler'
import { buildFileUploadMiddleware, FileUploadMiddleware } from './fileUpload'
import { buildLoggerMiddleware, LoggerMiddleware } from './logger'
import { buildValidateSchema, ValidateSchemaMiddleware } from './validateSchema'
import { BlockForbiddenCountriesMiddleware, buildBlockForbiddenCountries } from './blockForbiddenCountries'

type Params = Adapter

export type Middlewares = {
  authRequired: AuthRequiredMiddleware
  allowedIps: allowedIpsMiddleware
  errorHandler: ErrorHandlerMiddleware
  fileUpload: FileUploadMiddleware
  logger: LoggerMiddleware
  validateSchema: ValidateSchemaMiddleware
  blockForbiddenIps: BlockForbiddenCountriesMiddleware
}

export const buildMiddlewares = (params: Params): Middlewares => {
  const authRequired = buildAuthRequired(params)
  const allowedIps = buildAllowedIps()
  const blockForbiddenIps = buildBlockForbiddenCountries(params)
  const errorHandler = buildErrorHandler()
  const fileUpload = buildFileUploadMiddleware()
  const logger = buildLoggerMiddleware()
  const validateSchema = buildValidateSchema()

  return {
    authRequired,
    allowedIps,
    blockForbiddenIps,
    errorHandler,
    fileUpload,
    logger,
    validateSchema
  }
}
