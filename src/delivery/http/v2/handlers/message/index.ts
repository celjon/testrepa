import { IHandler } from '../types'
import { buildGet, Get } from './get'
import Express from 'express'
import { createRouteHandler } from '../../routeHandler'
import { buildMessageRules } from './rules'
import { DeliveryParams } from '@/delivery/types'
import { buildList, List } from './list'
import { buildSend, buildSendMiddleware, Send } from './send'
import { Middlewares } from '../../middlewares'
import { buildButtonClick, ButtonClick } from './button-click'
import { buildUpdate, Update } from './update'
import { buildDelete, Delete } from './delete'
import { buildDeleteMany, DeleteMany } from './delete-many'
import { buildRegenerate, Regenerate } from './regenerate'
import { buildSwitchNext, SwitchNext } from './switch-next'
import { buildSwitchPrevious, SwitchPrevious } from './switch-previous'
import { buildDeleteReport, DeleteReport } from './report/delete'
import { buildCreateReport, CreateReport } from './report/create'
import { buildListReport, ListReport } from './report/list'
import { buildListAll, ListAll } from './list-all'
import { buildChatPromptQueue, ChatPromptQueue } from './chat-prompt-queue'
import { buildCancelPromptQueue, CancelPromptQueue } from './cancel-prompt-queue'
import { buildZipDownloadPromptQueue, ZipDownloadPromptQueue } from './zip-download-prompt-queue'
import { buildOutputFilePromptQueue, OutputFilePromptQueue } from './output-file-prompt-queue'
import { buildPromptQueueStream, PromptQueueStream } from './prompt-queue-stream'

type Params = Pick<
  DeliveryParams,
  'message' | 'chat' | 'promptQueuesRepository' | 'middlewares' | 'storageGateway'
>

export type MessageMethods = {
  send: Send
  chatPromptQueue: ChatPromptQueue
  cancelPromptQueue: CancelPromptQueue
  outputFilePromptQueue: OutputFilePromptQueue
  zipDownloadPromptQueue: ZipDownloadPromptQueue
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
  promptQueueStream: PromptQueueStream
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
    chatPromptQueueRules,
    outputFilePromptQueueRules,
    queueCancelRules,
    regenerateMessageRules,
    switchMessageRules,
    listReportRules,
    deleteReportRules,
    createReportRules,
    downloadPromptQueueResultRules,
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
     * /message/chat-prompt-queue:
     *   post:
     *     tags: [Message]
     *     security:
     *       - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/chatPromptQueue'
     *     responses:
     *       '200':
     *         description: SSE‑соединение с прогрессом генерации
     *         content:
     *           text/event-stream:
     *             schema:
     *               type: string
     *             example: |
     *               data: {"queueId":"123e4567-e89b-12d3-a456-426614174000"}
     *               data: {"percent":33}
     *               data: {"percent":100,"done":true}
     *               [DONE]
     */
    namespace.post(
      '/chat-prompt-queue',
      sendMiddleware,
      chatPromptQueueRules,
      createRouteHandler(methods.chatPromptQueue),
    )

    /**
     * @openapi
     * /message/output-file-prompt-queue:
     *   post:
     *     tags:
     *       - Message
     *     security:
     *       - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/outputFilePromptQueue'
     *     responses:
     *       '200':
     *         description: SSE‑соединение с прогрессом генерации и ссылкой на ZIP
     *         content:
     *           text/event-stream:
     *             schema:
     *               type: string
     *             example: |
     *               data: {"queueId":"123e4567-e89b-12d3-a456-426614174000"}
     *               data: {"percent":33}
     *               data: {"percent":100,"done":true,"zipFilePath":"/tmp/responses_abc123.zip"}
     *               [DONE]
     */
    namespace.post(
      '/output-file-prompt-queue',
      sendMiddleware,
      outputFilePromptQueueRules,
      createRouteHandler(methods.outputFilePromptQueue),
    )

    /**
     * @openapi
     * /message/zip-download-prompt-queue:
     *   get:
     *     tags: [Message]
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: query
     *         name: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Архив с результатами запроса (ZIP-файл)
     *         content:
     *           application/zip:
     *             schema:
     *               type: string
     *               format: binary
     */
    namespace.get(
      '/zip-download-prompt-queue',
      sendMiddleware,
      downloadPromptQueueResultRules,
      createRouteHandler(methods.zipDownloadPromptQueue),
    )

    /**
     * @openapi
     * /message/prompt-queue/{id}/stream:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [Message]
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
     *                      $ref: '#/components/entities/PromptQueueEvent'
     */
    namespace.get(
      '/prompt-queue/:id/stream',
      middlewares.authRequired(),
      createRouteHandler(methods.promptQueueStream),
    )

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
    namespace.post(
      '/switch/previous/:id',
      switchMessageRules,
      createRouteHandler(methods.switchPrevious),
    )

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
    namespace.post(
      '/button/:buttonId/click',
      buttonClickRules,
      createRouteHandler(methods.buttonClick),
    )

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
  const promptQueue = buildChatPromptQueue(params)
  const streamPromptQueue = buildOutputFilePromptQueue(params)
  const zipDownloadPromptQueue = buildZipDownloadPromptQueue(params)
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
  const stream = buildPromptQueueStream(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        send,
        chatPromptQueue: promptQueue,
        outputFilePromptQueue: streamPromptQueue,
        zipDownloadPromptQueue,
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
        promptQueueStream: stream,
        report: {
          delete: deleteReport,
          create: createReport,
          list: listReport,
        },
      },
      params.middlewares,
    ),
  }
}
