import { body, check, query } from 'express-validator'
import { Middlewares } from '../../middlewares'
import { Platform } from '@prisma/client'

export const buildChatRules = ({ authRequired, validateSchema }: Middlewares) => {
  /**
   * @openapi
   * components:
   *   rules:
   *      createChat:
   *          required:
   *          properties:
   *             modelId:
   *                type: string
   *             groupId:
   *                type: string
   *             name:
   *                type: string
   *             highlight:
   *                type: string
   *             platform:
   *                type: string
   *                enum: [WEB, TELEGRAM]
   */
  const createChatRules = [
    authRequired({}),
    check('modelId').optional().isString(),
    check('groupId').optional().isString(),
    check('highlight').optional().isString(),
    check('name').optional({ nullable: true }).isString(),
    check('platform').optional().isString().isIn([Platform.WEB, Platform.TELEGRAM, 'telegram']),
    check('order').optional().isNumeric(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      updateChat:
   *          required:
   *          properties:
   *             name:
   *                type: string
   *             highlight:
   *                type: string
   *             modelId:
   *                type: string
   *             modelFunctionId:
   *                type: string
   *             initial:
   *                type: boolean
   *             groupId:
   *                type: string
   */
  const updateChatRules = [
    authRequired({}),
    check('name').optional().isString(),
    check('highlight').optional().isString(),
    check('modelId').optional().isString(),
    check('modelFunctionId').optional().isString(),
    check('initial').optional().isBoolean(),
    check('groupId').optional().isString(),
    check('order').optional().isNumeric(),
    validateSchema,
  ]

  const clearContextRules = [authRequired({}), validateSchema]

  const listRules = [
    authRequired({}),
    query('groupId').optional().isString(),
    query('page').optional().isInt({
      min: 1,
    }),
    query('search').optional().isString(),
    query('sort').optional().isString(),
    query('sortDirection').optional().isString(),
    validateSchema,
  ]

  const listMessagesRules = [
    authRequired({}),
    query('page').optional().isInt({
      min: 1,
    }),
    query('quantity').optional().isInt({
      min: 1,
    }),
    validateSchema,
  ]

  const deleteChatRules = [authRequired({}), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *      deleteManyChat:
   *          required:
   *            - ids
   *          properties:
   *             ids:
   *                type: array
   *                items:
   *                  type: string
   */
  const deleteManyChatRules = [authRequired({}), check('ids').isArray(), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *      deleteAllExcept:
   *          required:
   *            - idsToKeep
   *          properties:
   *             idsToKeep:
   *                type: array
   *                items:
   *                  type: string
   *             groupIdsToKeep:
   *                type: array
   *                items:
   *                  type: string
   */
  const deleteAllChatsExceptRules = [
    authRequired({}),
    check('idsToKeep').isArray(),
    check('groupIdsToKeep').optional().isArray(),
    validateSchema,
  ]

  const getChatRules = [authRequired({}), validateSchema]

  const getInitialChatRules = [authRequired({}), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *     getChatSettings:
   *       properties:
   *         all:
   *           type: integer
   *         elements:
   *           type: integer
   *         platform:
   *           type: string
   *           enum: [WEB, MAIN, TELEGRAM]
   */
  const getChatSettingsRules = [
    authRequired(),
    query('all').optional().isInt(),
    query('elements').optional().isInt(),
    query('platform').optional().isString().isIn([Platform.WEB, Platform.MAIN, Platform.TELEGRAM]),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      updateChatSettings:
   *          required:
   *            - name
   *            - value
   *          properties:
   *             name:
   *                type: string
   *             value:
   *                oneOf:
   *                  - type: string
   *                  - type: number
   *                  - type: boolean
   */
  const updateChatSettingsRules = [authRequired(), validateSchema]

  const moveChatsRules = [
    authRequired(),
    body('ids').isArray(),
    body('groupId').optional(),
    body('startChatId').isString().optional(),
    validateSchema,
  ]

  return {
    createChatRules,
    getChatRules,
    getInitialChatRules,
    deleteChatRules,
    deleteManyChatRules,
    deleteAllChatsExceptRules,
    clearContextRules,
    listRules,
    listMessagesRules,
    updateChatRules,
    getChatSettingsRules,
    updateChatSettingsRules,
    moveChatsRules,
  }
}
