import { buildCreateChat, CreateChat } from './create'
import { buildDeleteChat, DeleteChat } from './delete'
import { buildList, List } from './list'
import { buildGetChat, GetChat } from './get'
import { buildClearContext, ClearContext } from './clearContext'
import { IHandler } from '../types'
import Express from 'express'
import { buildChatRules } from './rules'
import { createRouteHandler } from '../../routeHandler'
import { DeliveryParams } from '@/delivery/types'
import { buildUpdate, Update } from './update'
import { buildStream, Stream } from './stream'
import { buildGetSettings, GetSettings } from './getSettings'
import { buildUpdateSettings, UpdateSettings } from './updateSettings'
import { buildGetJobs, GetJobs } from './getJobs'
import { buildStop, Stop } from './stop'
import { buildGetInitialChat, GetInitialChat } from './getInitial'
import { buildDeleteMany, DeleteMany } from './deleteMany'
import { buildMove, Move } from './move'
import { Middlewares } from '../../middlewares'
import { buildDeleteAllExcept, DeleteAllExcept } from './deleteAllExcept'

type Params = Pick<DeliveryParams, 'chat' | 'message' | 'middlewares'>

export type ChatMethods = {
  create: CreateChat
  get: GetChat
  getInitial: GetInitialChat
  delete: DeleteChat
  deleteMany: DeleteMany
  deleteAllExcept: DeleteAllExcept
  clearContext: ClearContext
  list: List
  update: Update
  getSettings: GetSettings
  updateSettings: UpdateSettings
  stream: Stream
  getJobs: GetJobs
  stop: Stop
  move: Move
}

const buildRegisterRoutes = (methods: ChatMethods, middlewares: Middlewares) => {
  const {
    clearContextRules,
    createChatRules,
    deleteChatRules,
    deleteManyChatRules,
    deleteAllChatsExceptRules,
    getChatRules,
    getChatSettingsRules,
    getInitialChatRules,
    listRules,
    moveChatsRules,
    updateChatRules,
    updateChatSettingsRules
  } = buildChatRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /chat:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [Chat]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/createChat'
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/Chat'
     */
    namespace.post('/', createChatRules, createRouteHandler(methods.create))

    /**
     * @openapi
     * /chat/except:
     *   delete:
     *     security:
     *      - bearerAuth: []
     *     tags: [Chat]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: idsToKeep
     *         in: body
     *         required: true
     *         type: array
     *         items:
     *           type: string
     *       - name: groupIdsToKeep
     *         in: body
     *         type: array
     *         items:
     *           type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                  type: array
     *                  items:
     *                    $ref: '#/components/entities/Chat'
     */
    namespace.delete('/except', deleteAllChatsExceptRules, createRouteHandler(methods.deleteAllExcept))

    /**
     * @openapi
     * /chat/{id}:
     *   delete:
     *     security:
     *      - bearerAuth: []
     *     tags: [Chat]
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
     *                      $ref: '#/components/entities/Chat'
     */
    namespace.delete('/:id', deleteChatRules, createRouteHandler(methods.delete))

    /**
     * @openapi
     * /chat:
     *   delete:
     *     security:
     *      - bearerAuth: []
     *     tags: [Chat]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: ids
     *         in: body
     *         required: true
     *         type: array
     *         items:
     *           type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                  type: array
     *                  items:
     *                    $ref: '#/components/entities/Chat'
     */
    namespace.delete('/', deleteManyChatRules, createRouteHandler(methods.deleteMany))

    /**
     * @openapi
     * /chat/list:
     *   get:
     *     tags: [Chat]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: page
     *         in: query
     *         type: number
     *       - name: groupId
     *         in: query
     *         type: string
     *       - name: search
     *         in: query
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                    properties:
     *                        data:
     *                          type: array
     *                          items:
     *                            $ref: '#/components/entities/Chat'
     *                        pages:
     *                          type: number
     */
    namespace.get('/list', listRules, createRouteHandler(methods.list))

    /**
     * @openapi
     * /chat/initial:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [Chat]
     *     produces:
     *       - application/json
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/Chat'
     */
    namespace.get('/initial', getInitialChatRules, createRouteHandler(methods.getInitial))

    /**
     * @openapi
     * /chat/{id}:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [Chat]
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
     *                      $ref: '#/components/entities/Chat'
     */
    namespace.get('/:id', getChatRules, createRouteHandler(methods.get))

    namespace.patch('/move', moveChatsRules, createRouteHandler(methods.move))

    /**
     * @openapi
     * /chat/{id}:
     *   patch:
     *     tags: [Chat]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/updateChat'
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
     *                      $ref: '#/components/entities/Chat'
     */
    namespace.patch('/:id', updateChatRules, createRouteHandler(methods.update))

    /**
     * @openapi
     * /chat/{id}/clear-context:
     *   put:
     *     tags: [Chat]
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
     *          description: Successful request
     */
    namespace.put('/:id/clear-context', clearContextRules, createRouteHandler(methods.clearContext))

    /**
     * @openapi
     * /chat/{id}/settings:
     *   get:
     *     tags: [Chat]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *       - name: all
     *         in: query
     *         type: number
     *       - name: elements
     *         in: query
     *         type: number
     *     responses:
     *        200:
     *          description: Successful request
     */
    namespace.get('/:id/settings', getChatSettingsRules, createRouteHandler(methods.getSettings))

    /**
     * @openapi
     * /chat/{id}/settings:
     *   patch:
     *     tags: [Chat]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     requestBody:
     *         required: true
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/rules/updateChatSettings'
     *     responses:
     *        200:
     *          description: Successful request
     */
    namespace.patch(
      '/:id/settings',
      middlewares.fileUpload().array('value'),
      updateChatSettingsRules,
      createRouteHandler(methods.updateSettings)
    )

    /**
     * @openapi
     * /chat/{id}/stream:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [Chat]
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
     *                      $ref: '#/components/entities/ChatEvent'
     */
    namespace.get('/:id/stream', middlewares.authRequired(), createRouteHandler(methods.stream))

    /**
     * @openapi
     * /chat/{id}/jobs:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [Chat]
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
     *                  type: array
     *                  items:
     *                      $ref: '#/components/entities/Job'
     */
    namespace.get('/:id/jobs', middlewares.authRequired(), createRouteHandler(methods.getJobs))

    /**
     * @openapi
     * /chat/{id}/stop:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [Chat]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        200:
     *            description: Successful request
     */
    namespace.post('/:id/stop', middlewares.authRequired(), createRouteHandler(methods.stop))

    root.use('/chat', namespace)
  }
}

export const buildChatHandler = (params: Params): IHandler => {
  const create = buildCreateChat(params)
  const get = buildGetChat(params)
  const getInitial = buildGetInitialChat(params)
  const deleteChat = buildDeleteChat(params)
  const deleteMany = buildDeleteMany(params)
  const deleteAllExcept = buildDeleteAllExcept(params)
  const clearContext = buildClearContext(params)
  const list = buildList(params)
  const update = buildUpdate(params)
  const getSettings = buildGetSettings(params)
  const updateSettings = buildUpdateSettings(params)
  const stream = buildStream(params)
  const getJobs = buildGetJobs(params)
  const stop = buildStop(params)
  const move = buildMove(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        create,
        get,
        getInitial,
        delete: deleteChat,
        deleteMany,
        deleteAllExcept,
        clearContext,
        list,
        update,
        getSettings,
        updateSettings,
        stream,
        getJobs,
        stop,
        move
      },
      params.middlewares
    )
  }
}
