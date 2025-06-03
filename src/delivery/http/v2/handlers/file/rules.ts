import { check } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildFileRules = ({ authRequired, validateSchema }: Middlewares) => {
  /**
   * Decrypt file
   */
  const decryptRules = [authRequired({}), check('fileId').exists().isString(), validateSchema]

  return {
    decryptRules
  }
}
