import { body, check } from 'express-validator'
import { Middlewares } from '../../middlewares'
import { Platform } from '@prisma/client'

export const buildModelRules = ({ authRequired, validateSchema }: Middlewares) => {
  const updateModelRules = [authRequired({}), body('modelId').isString(), validateSchema]

  const disableModelRules = [
    authRequired({}),
    body('modelId').notEmpty().isString(),
    body('platform').notEmpty().isString().isIn([Platform.API, Platform.WEB, Platform.TELEGRAM]),
    validateSchema
  ]

  const enableModelRules = [
    authRequired({}),
    body('modelId').notEmpty().isString(),
    body('platform').notEmpty().isString().isIn([Platform.API, Platform.WEB, Platform.TELEGRAM]),
    validateSchema
  ]

  const listModelsRules = [
    check('platform').optional().isString().isIn([Platform.API, Platform.WEB, Platform.TELEGRAM, 'telegram']),
    validateSchema
  ]

  return {
    updateModelRules,
    disableModelRules,
    enableModelRules,
    listModelsRules
  }
}
