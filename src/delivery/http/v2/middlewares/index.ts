import { Adapter } from '@/domain/types'
import { buildAuthRequired, AuthRequiredMiddleware } from './auth-required'
import { buildAllowedIps, allowedIpsMiddleware } from './allowed-ips'
import { buildErrorHandler, ErrorHandlerMiddleware } from './error-handler'
import { buildFileUploadMiddleware, FileUploadMiddleware } from './file-upload'
import { buildLoggerMiddleware, LoggerMiddleware } from './logger'
import { buildValidateSchema, ValidateSchemaMiddleware } from './validate-schema'
import {
  buildBlockForbiddenCountries,
  BlockForbiddenCountriesMiddleware,
} from './block-forbidden-countries'

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
    validateSchema,
  }
}
