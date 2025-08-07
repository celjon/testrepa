import { body, param } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildDeveloperRules = ({ authRequired, validateSchema }: Middlewares) => {
  const createKeyRules = [authRequired(), body('label').optional().isString(), validateSchema]
  const listKeysRules = [authRequired()]
  const deleteKeyRules = [authRequired(), param('id').isString(), validateSchema]
  const deleteManyKeyRules = [authRequired(), body('ids').isArray(), validateSchema]
  const updateKeyRules = [
    authRequired(),
    param('id').isString(),
    body('label').isString(),
    validateSchema,
  ]

  return {
    createKeyRules,
    listKeysRules,
    deleteKeyRules,
    deleteManyKeyRules,
    updateKeyRules,
  }
}
