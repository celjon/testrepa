import { body } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildDataAnalysisRules = ({ authRequired, validateSchema }: Middlewares) => {
  const clusterizeExcelRules = [
    authRequired({ required: true }),
    body('sheet_name').optional().isString(),
    body('target_columns').exists().notEmpty().isArray({ min: 1 }),
    validateSchema
  ]

  return {
    clusterizeExcelRules
  }
}
