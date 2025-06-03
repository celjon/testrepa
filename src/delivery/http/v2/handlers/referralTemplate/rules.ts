import { query } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildReferralTemplateRules = ({ authRequired, validateSchema }: Middlewares) => {
  const listRules = [
    authRequired(),
    query('page').optional().isNumeric(),
    query('search').optional().isString(),
    query('locale').optional().isString(),
    validateSchema
  ]

  return {
    listRules
  }
}
