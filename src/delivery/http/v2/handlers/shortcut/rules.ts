import { check } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildShortcutRules = ({ authRequired, validateSchema }: Middlewares) => {
  /**
   * @openapi
   * components:
   *   rules:
   *      createShortcut:
   *          required:
   *            - name
   *            - text
   *            - autosend
   *          properties:
   *            name:
   *                type: string
   *            text:
   *                type: string
   *            autosend:
   *                type: boolean
   */
  const createRules = [
    authRequired(),
    check('name').exists().isString().not().isEmpty(),
    check('text').exists().isString().not().isEmpty(),
    check('autosend').exists().isBoolean(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      updateShortcut:
   *          required:
   *            - name
   *            - text
   *            - autosend
   *          properties:
   *            name:
   *                type: string
   *            text:
   *                type: string
   *            autosend:
   *                type: boolean
   */
  const updateRules = [
    authRequired(),
    check('name').optional().isString().not().isEmpty(),
    check('text').optional().isString().not().isEmpty(),
    check('autosend').optional().isBoolean(),
    validateSchema,
  ]

  const listShortcutRules = [authRequired()]

  const deleteShortcutRules = [authRequired()]

  return {
    createRules,
    updateRules,
    listShortcutRules,
    deleteShortcutRules,
  }
}
