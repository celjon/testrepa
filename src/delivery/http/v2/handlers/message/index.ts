import { IHandler } from '../types'
import { buildGet, Get } from './get'
import Express from 'express'
import { createRouteHandler } from '../../routeHandler'
import { buildMessageRules } from './rules'
import { DeliveryParams } from '@/delivery/types'
import { buildList, List } from './list'
import { buildSend, buildSendMiddleware, Send } from './send'
import { Middlewares } from '../../middlewares'
import { buildButtonClick, ButtonClick } from './buttonClick'
import { buildUpdate, Update } from './update'
import { buildDelete, Delete } from './delete'
import { buildDeleteMany, DeleteMany } from './deleteMany'
import { buildRegenerate, Regenerate } from './regenerate'
import { buildSwitchNext, SwitchNext } from './switchNext'
import { buildSwitchPrevious, SwitchPrevious } from './switchPrevious'
import { buildDeleteReport, DeleteReport } from './report/delete'
import { buildCreateReport, CreateReport } from './report/create'
import { buildListReport, ListReport } from './report/list'
import { buildListAll, ListAll } from './listAll'
import { buildPromptQueue, PromptQueue } from './prompt-queue'
import { CancelPromptQueue, buildCancelPromptQueue } from './cancel-prompt-queue'

type Params = Pick<DeliveryParams, 'message' | 'promptQueuesRepository' | 'middlewares'>

export type MessageMethods = {
  send: Send
  promptQueue: PromptQueue
  cancelPromptQueue: CancelPromptQueue
  regenerate: Regenerate
  switchNext: SwitchNext
  switchPrevious: SwitchPrevious
  buttonClick: ButtonClick
  get: Get
  list: List
  listAll: ListAll
  update: Update
  delete: Delete
  deleteMany: DeleteMany
  report: {
    delete: DeleteReport
    create: CreateReport
    list: ListReport
  }
}

const buildRegisterRoutes = (methods: MessageMethods, middlewares: Middlewares) => {
  const {
    deleteManyMessagesRules,
    deleteMessageRules,
    updateMessageRules,
    buttonClickRules,
    getMessageRules,
    listMessagesRules,
    listAllMessagesRules,
    sendMessageRules,
    promptQueueRules,
    queueCancelRules,
    regenerateMessageRules,
    switchMessageRules,
    listReportRules,
    deleteReportRules,
    createReportRules
  } = buildMessageRules(middlewares)

  const sendMiddleware = buildSendMiddleware(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /message/send:
     *   post:
     *     tags: [Message]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/rules/sendMessage'
     *     responses:
     *        201:
     *           content:
     *              application/json:
     *                schema:
     *                   $ref: '#/components/entities/Message'
     */
    namespace.post('/send', sendMiddleware, sendMessageRules, createRouteHandler(methods.send))

    /**
     * @openapi
     * /message/prompt-queue:
     *   post:
     *     tags: [Message]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/rules/promptQueue'
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 queueId:
     *                   type: string
     */
    namespace.post('/prompt-queue', sendMiddleware, promptQueueRules, createRouteHandler(methods.promptQueue))

    /**
     * @openapi
     * /message/queue-cancel:
     *   post:
     *     tags: [Message]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - queueId
     *             properties:
     *               queueId:
     *                 type: string
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     */
    namespace.post('/queue-cancel', queueCancelRules, createRouteHandler(methods.cancelPromptQueue))

    namespace.post('/regenerate', regenerateMessageRules, createRouteHandler(methods.regenerate))

    /**
     * @openapi
     * /message/switch/next/{id}:
     *   post:
     *     tags: [Message]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       201:
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/Message'
     */
    namespace.post('/switch/next/:id', switchMessageRules, createRouteHandler(methods.switchNext))

    /**
     * @openapi
     * /message/switch/previous/{id}:
     *   post:
     *     tags: [Message]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        201:
     *           content:
     *              application/json:
     *                schema:
     *                   $ref: '#/components/entities/Message'
     */
    namespace.post('/switch/previous/:id', switchMessageRules, createRouteHandler(methods.switchPrevious))

    /**
     * @openapi
     * /message/button/{buttonId}/click:
     *   post:
     *     tags: [Message]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: buttonId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        201:
     *           content:
     *              application/json:
     *                schema:
     *                   $ref: '#/components/entities/MessageButton'
     */
    namespace.post('/button/:buttonId/click', buttonClickRules, createRouteHandler(methods.buttonClick))

    /**
     * @openapi
     * /message/list:
     *   get:
     *     tags: [Message]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: chatId
     *         in: query
     *         type: string
     *       - name: page
     *         in: query
     *         type: number
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                    properties:
     *                        data:
     *                           type: array
     *                           items:
     *                              allOf:
     *                                - $ref: '#/components/entities/Message'
     *                                - type: object
     *                                  properties:
     *                                    transaction:
     *                                       $ref: '#/components/entities/Transaction'
     *                        pages:
     *                          type: number
     */
    namespace.get('/list', listMessagesRules, createRouteHandler(methods.list))

    /**
     * @openapi
     * /message/list-all:
     *   get:
     *     tags: [Message]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: chatId
     *         in: query
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                       type: array
     *                       items:
     *                          allOf:
     *                            - $ref: '#/components/entities/Message'
     *                            - type: object
     */
    namespace.get('/list-all', listAllMessagesRules, createRouteHandler(methods.listAll))

    /**
     * @openapi
     * /message/{id}:
     *   get:
     *     tags: [Message]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                   $ref: '#/components/entities/Message'
     */
    namespace.get('/:id', getMessageRules, createRouteHandler(methods.get))

    namespace.patch('/:id', updateMessageRules, createRouteHandler(methods.update))

    namespace.delete('/', deleteManyMessagesRules, createRouteHandler(methods.deleteMany))

    namespace.delete('/:id', deleteMessageRules, createRouteHandler(methods.delete))

    /**
     * @openapi
     * /message/report:
     *   delete:
     *     tags: [Message]
     *     summary: Deleted message report
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - message_id
     *             properties:
     *               message_id:
     *                 type: string
     *                 description: Message ID for deleting report
     *     responses:
     *       200:
     *         description: Deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/Report'
     */
    namespace.delete('/report', deleteReportRules, createRouteHandler(methods.report.delete))

    /**
     * @openapi
     * /message/report/list:
     *   post:
     *     tags: [Message]
     *     summary: Get a list of reports for a specific chat
     *     description: Returns a list of all reports associated with the specified chat.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - chat_id
     *             properties:
     *               chat_id:
     *                 type: string
     *                 description: The ID of the chat for which to retrieve reports.
     *     responses:
     *       200:
     *         description: Successful response. Returns a list of reports.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/entities/Report'
     *
     */
    namespace.post('/report/list', listReportRules, createRouteHandler(methods.report.list))

    /**
     * @openapi
     * /message/report/create:
     *   post:
     *     tags: [Message]
     *     summary: Create a new report
     *     description: Creates a new report for a specific message in a chat.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - user_id
     *               - message_id
     *               - description
     *               - chat_id
     *             properties:
     *               user_id:
     *                 type: string
     *                 description: The ID of the user creating the report.
     *               message_id:
     *                 type: string
     *                 description: The ID of the message being reported.
     *               description:
     *                 type: string
     *                 description: A description of the report (e.g., reason for reporting).
     *               chat_id:
     *                 type: string
     *                 description: The ID of the chat where the message is located.
     *     responses:
     *       200:
     *         description: Successfully created the report.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/Report'
     *
     */
    namespace.post('/report/create', createReportRules, createRouteHandler(methods.report.create))

    root.use('/message', namespace)
  }
}

export const buildMessageHandler = (params: Params): IHandler => {
  const send = buildSend(params)
  const promptQueue = buildPromptQueue(params)
  const cancelPromptQueue = buildCancelPromptQueue(params)
  const regenerate = buildRegenerate(params)
  const switchNext = buildSwitchNext(params)
  const switchPrevious = buildSwitchPrevious(params)
  const buttonClick = buildButtonClick(params)
  const get = buildGet(params)
  const list = buildList(params)
  const listAll = buildListAll(params)
  const update = buildUpdate(params)
  const deleteMessage = buildDelete(params)
  const deleteMany = buildDeleteMany(params)
  const deleteReport = buildDeleteReport(params)
  const createReport = buildCreateReport(params)
  const listReport = buildListReport(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        send,
        promptQueue,
        cancelPromptQueue,
        regenerate,
        switchNext,
        switchPrevious,
        buttonClick,
        get,
        list,
        listAll,
        update,
        delete: deleteMessage,
        deleteMany,
        report: {
          delete: deleteReport,
          create: createReport,
          list: listReport
        }
      },
      params.middlewares
    )
  }
}
