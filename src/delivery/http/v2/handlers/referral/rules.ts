import { check } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildReferralRules = ({ authRequired, validateSchema }: Middlewares) => {
  /**
   * @openapi
   * components:
   *   rules:
   *      createReferral:
   *          required:
   *            - templateId
   *          properties:
   *            templateId:
   *                type: string
   */
  const createRules = [authRequired(), check('templateId').exists().isString().not().isEmpty(), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *      withdrawReferral:
   *          required:
   *            - details
   *          properties:
   *            details:
   *                type: object
   */
  const withdrawRules = [authRequired(), check('details').exists().isObject().not().isEmpty(), validateSchema]

  const listReferralRules = [authRequired()]
  const deleteReferralRules = [authRequired()]

  return {
    createRules,
    withdrawRules,
    listReferralRules,
    deleteReferralRules
  }
}
