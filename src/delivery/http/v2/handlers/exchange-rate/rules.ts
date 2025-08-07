import { body, param } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildExchangeRateRules = ({ authRequired, validateSchema }: Middlewares) => {
  const getExchangeRateRules = [param('exchangeRateId').isString(), validateSchema]

  const listExchangeRatesRules = [param('amount').optional().isString(), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *     createExchangeRate:
   *       type: object
   *       properties:
   *         start_date:
   *           type: string
   *           format: date
   *         caps_per_rub:
   *           type: number
   *         caps_per_usd:
   *           type: number
   *       required:
   *         - start_date
   *         - caps_per_rub
   *         - caps_per_usd
   */
  const createExchangeRateRules = [
    authRequired({ adminOnly: true }),
    body('start_date').isISO8601(),
    body('caps_per_rub').isNumeric(),
    body('caps_per_usd').isNumeric(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *     updateExchangeRate:
   *       type: object
   *       properties:
   *         start_date:
   *           type: string
   *           format: date
   *         caps_per_rub:
   *           type: number
   *         caps_per_usd:
   *           type: number
   */
  const updateExchangeRateRules = [
    authRequired({ adminOnly: true }),
    param('exchangeRateId').isString(),
    body('start_date').optional().isISO8601(),
    body('caps_per_rub').optional().isNumeric(),
    body('caps_per_usd').optional().isNumeric(),
    validateSchema,
  ]

  const deleteExchangeRateRules = [
    authRequired({ adminOnly: true }),
    param('exchangeRateId').isString(),
    validateSchema,
  ]

  return {
    getExchangeRateRules,
    listExchangeRatesRules,
    createExchangeRateRules,
    updateExchangeRateRules,
    deleteExchangeRateRules,
  }
}
