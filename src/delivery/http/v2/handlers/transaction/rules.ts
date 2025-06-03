import { query } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildTransactionRules = ({ authRequired, validateSchema }: Middlewares) => {
  const listTransactionsRules = [
    authRequired({}),
    query('page').optional().isInt({
      min: 1
    }),
    validateSchema
  ]

  return {
    listTransactionsRules
  }
}
