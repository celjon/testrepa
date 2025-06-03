import { body, header } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildWebhookRules = ({ validateSchema }: Middlewares) => {
  const yoomoneyRules = [
    body('type').exists().notEmpty().isString().equals('notification'),
    body('event').exists().notEmpty().isString(),
    body('object').exists().notEmpty().isObject(),
    validateSchema
  ]

  const hashbonRules = [
    body('id').exists(),
    body('status').exists().notEmpty().isInt(),
    header('sign').exists().notEmpty().isHash('sha256'),
    validateSchema
  ]

  const tinkoffRules = [body('PaymentId').exists().isInt(), body('Status').exists().notEmpty().isString(), validateSchema]

  return {
    yoomoneyRules,
    hashbonRules,
    tinkoffRules
  }
}
