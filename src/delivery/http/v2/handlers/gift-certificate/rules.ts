import { body } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildGiftCertificateRules = ({ authRequired, validateSchema }: Middlewares) => {
  /**
   * @openapi
   * components:
   *   rules:
   *     create:
   *       required:
   *         - amount
   *       properties:
   *         amount:
   *           type: number
   *         message:
   *           type: string
   *         recipient_name:
   *           type: string
   */
  const createRules = [body('amount').isNumeric(), authRequired(), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *     activate:
   *       required:
   *         - code
   *       properties:
   *         code:
   *           type: string
   */
  const activateRules = [
    body('code')
      .isString()
      .matches(/^[a-zA-Z0-9]{4}(-[a-zA-Z0-9]{4}){3}$/)
      .withMessage(
        'Код должен быть в формате xxxx-xxxx-xxxx-xxxx и содержать только буквы и цифры',
      ),
    authRequired({}),
    validateSchema,
  ]
  return {
    createRules,
    activateRules,
  }
}
