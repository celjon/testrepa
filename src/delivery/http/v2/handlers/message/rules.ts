import { body, param, query } from 'express-validator'
import { Middlewares } from '../../middlewares'
import { Platform } from '@prisma/client'

export const buildMessageRules = ({ authRequired, validateSchema }: Middlewares) => {
  /**
   * @openapi
   * components:
   *   rules:
   *      sendMessage:
   *          required:
   *            - chatId
   *            - message
   *          properties:
   *            chatId:
   *                type: string
   *            message:
   *                type: string
   *            model_id:
   *                type: string
   *            tgBotMessageId:
   *                type: string
   *            platform:
   *                type: string
   *                enum: [MAIN, DASHBOARD, TELEGRAM, BOTHUB_API]
   */
  const sendMessageRules = [
    authRequired(),
    body('chatId').exists().notEmpty().isString(),
    body('message').optional().isString(),
    body('model_id').optional().isString(),
    body('tgBotMessageId').optional().isString(),
    body('platform')
      .optional()
      .isString()
      .isIn([Platform.MAIN, Platform.DASHBOARD, Platform.TELEGRAM, Platform.BOTHUB_API]),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *     chatPromptQueue:
   *       required:
   *         - prompts
   *       properties:
   *         chatId:
   *           type: string
   *         prompts:
   *           type: array
   *           items:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *               include_context:
   *                 type: boolean
   *               modelId:
   *                 type: string
   */
  const chatPromptQueueRules = [
    authRequired(),
    body('chatId').optional().exists().isString(),
    body('prompts').isArray().notEmpty(),
    body('prompts.*.message').exists().isString(),
    body('prompts.*.include_context').exists().isBoolean(),
    body('prompts.*.modelId').exists().isString(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *     outputFilePromptQueue:
   *       required:
   *         - prompts
   *       properties:
   *         chatId:
   *           type: string
   *         markup:
   *           type: string
   *           enum:
   *             - md
   *             - html
   *             - docx
   *         outputOneFile:
   *           type: boolean
   *         prompts:
   *           type: array
   *           items:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *               include_context:
   *                 type: boolean
   *               modelId:
   *                 type: string
   */

  const outputFilePromptQueueRules = [
    authRequired(),
    body('chatId').optional().exists().isString(),
    body('markup').optional().exists().isString().isIn(['md', 'docx', 'html']),
    body('outputOneFile').optional().exists().isBoolean(),
    body('prompts').isArray().notEmpty(),
    body('prompts.*.message').exists().isString(),
    body('prompts.*.include_context').exists().isBoolean(),
    body('prompts.*.modelId').exists().isString(),
    validateSchema,
  ]
  /**
   * @openapi
   * components:
   *   rules:
   *     downloadPromptQueueResult:
   *       required:
   *         - path
   *       properties:
   *         path:
   *           type: string
   */
  const downloadPromptQueueResultRules = [query('path').isString(), validateSchema]

  const queueCancelRules = [authRequired(), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *      regenerateMessage:
   *          required:
   *            - id
   *          properties:
   *             id:
   *                type: string
   *             userMessageId:
   *                type: string
   *             platform:
   *                type: string
   *                enum: [MAIN, DASHBOARD, TELEGRAM, BOTHUB_API]
   */
  const regenerateMessageRules = [
    authRequired(),
    body('id').isString(),
    body('userMessageId').optional().isString(),
    body('platform')
      .optional()
      .isString()
      .isIn([Platform.MAIN, Platform.DASHBOARD, Platform.TELEGRAM, Platform.BOTHUB_API]),
    validateSchema,
  ]

  const switchMessageRules = [authRequired(), param('id').isString(), validateSchema]

  const getMessageRules = [authRequired(), validateSchema]

  const updateMessageRules = [authRequired(), body('content').notEmpty().isString(), validateSchema]

  const listMessagesRules = [
    authRequired({}),
    query('page').optional().isInt({
      min: 1,
    }),
    query('chatId').notEmpty().isString(),
    query('quantity').optional().isInt({
      min: 1,
    }),
    validateSchema,
  ]

  const listAllMessagesRules = [
    authRequired({}),
    query('chatId').notEmpty().isString(),
    validateSchema,
  ]

  const deleteMessageRules = [authRequired(), param('id').isString(), validateSchema]

  const deleteManyMessagesRules = [authRequired(), body('ids').isArray(), validateSchema]

  const buttonClickRules = [authRequired(), validateSchema]

  const deleteReportRules = [authRequired(), body('message_id').exists().isString(), validateSchema]

  const createReportRules = [authRequired(), body('message_id').exists().isString(), validateSchema]

  const listReportRules = [authRequired(), body('chat_id').exists().isString(), validateSchema]

  return {
    listReportRules,
    createReportRules,
    deleteReportRules,
    sendMessageRules,
    chatPromptQueueRules,
    outputFilePromptQueueRules,
    queueCancelRules,
    regenerateMessageRules,
    switchMessageRules,
    getMessageRules,
    listMessagesRules,
    listAllMessagesRules,
    updateMessageRules,
    deleteMessageRules,
    deleteManyMessagesRules,
    buttonClickRules,
    downloadPromptQueueResultRules,
  }
}
