import { body } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildAIToolsRules = ({ authRequired, validateSchema }: Middlewares) => {
  const completionRules = [authRequired(), body('model').isString(), validateSchema]

  return {
    completionRules
  }
}
