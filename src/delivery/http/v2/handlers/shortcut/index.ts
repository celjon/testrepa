import { IHandler } from '../types'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildList, List } from './list'
import { buildUpdate, Update } from './update'
import Express from 'express'
import { createRouteHandler } from '../../routeHandler'
import { Middlewares } from '../../middlewares'
import { buildShortcutRules } from './rules'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'shortcut' | 'middlewares'>

export type ShortcutMethods = {
  list: List
  delete: Delete
  create: Create
  update: Update
}

const buildRegisterRoutes = (methods: ShortcutMethods, middlewares: Middlewares) => {
  const { createRules, deleteShortcutRules, listShortcutRules, updateRules } = buildShortcutRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()
    /**
     * @openapi
     * /shortcut:
     *   post:
     *     tags: [Shortcut]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/rules/createShortcut'
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/Shortcut'
     */
    namespace.post('/', createRules, createRouteHandler(methods.create))

    /**
     * @openapi
     * /shortcut/list:
     *   get:
     *     tags: [Shortcut]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/entities/Shortcut'
     */
    namespace.get('/list', listShortcutRules, createRouteHandler(methods.list))

    /**
     * @openapi
     * /shortcut/{id}:
     *   delete:
     *     tags: [Shortcut]
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
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/Shortcut'
     */
    namespace.delete('/:id', deleteShortcutRules, createRouteHandler(methods.delete))

    /**
     * @openapi
     * /shortcut/{id}:
     *   patch:
     *     tags: [Shortcut]
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
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/rules/updateShortcut'
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/Shortcut'
     */
    namespace.patch('/:id', updateRules, createRouteHandler(methods.update))
    root.use('/shortcut', namespace)
  }
}

export const buildShortcutHandler = (params: Params): IHandler => {
  const list = buildList(params)
  const deleteShortcut = buildDelete(params)
  const create = buildCreate(params)
  const update = buildUpdate(params)
  return {
    registerRoutes: buildRegisterRoutes(
      {
        create,
        delete: deleteShortcut,
        list,
        update
      },
      params.middlewares
    )
  }
}
