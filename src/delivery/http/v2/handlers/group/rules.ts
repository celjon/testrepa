import { body, check, param, query } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildGroupRules = ({ authRequired, validateSchema }: Middlewares) => {
  const getChatsRules = [authRequired(), param('id').isString(), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *      createGroup:
   *          required:
   *            - name
   *          properties:
   *             name:
   *                type: string
   *             preset_id:
   *                type: string
   *             highlight:
   *                type: string
   */
  const createGroupRules = [
    authRequired(),
    check('name').exists().notEmpty().isString(),
    check('preset_id').optional().isString(),
    check('highlight').optional().isString(),
    check('order').optional().isNumeric(),
    validateSchema
  ]

  const deleteGroupRules = [authRequired(), validateSchema]

  const deleteManyGroupRules = [authRequired(), body('ids').isArray().exists(), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *      updateGroup:
   *          required:
   *            - name
   *            - highlight
   *          properties:
   *            name:
   *                type: string
   *            highlight:
   *                type: string
   *                description: group card color
   */
  const updateGroupRules = [
    authRequired(),
    check('name').optional().isString(),
    check('highlight').optional().isString(),
    check('order').optional().isNumeric(),
    validateSchema
  ]

  const listGroupsRules = [
    authRequired({}),
    query('page').optional().isInt({
      min: 1
    }),
    query('search').optional().isString(),
    validateSchema
  ]

  const moveGroupsRules = [authRequired(), body('groupId').isString(), body('startGroupId').isString().optional(), validateSchema]

  return {
    getChatsRules,
    createGroupRules,
    deleteGroupRules,
    deleteManyGroupRules,
    updateGroupRules,
    listGroupsRules,
    moveGroupsRules
  }
}
