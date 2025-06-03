import { body } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildOpenaiRules = ({ authRequired, validateSchema }: Middlewares) => {
  const completionRules = [authRequired(), body('model').isString(), validateSchema]

  return {
    completionRules
  }
}
