import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { buildCreateGroup, CreateGroup } from './create'
import { buildDelete, Delete } from './delete'
import { IHandler } from '../types'
import { createRouteHandler } from '../../routeHandler'
import { buildGroupRules } from './rules'
import { buildUpdate, Update } from './update'
import { buildList, List } from './list'
import { buildDeleteMany, DeleteMany } from './deleteMany'
import { Middlewares } from '../../middlewares'
import { buildMove, Move } from './move'

type Params = Pick<DeliveryParams, 'group' | 'chat' | 'middlewares'>

export type GroupMethods = {
  create: CreateGroup
  delete: Delete
  deleteMany: DeleteMany
  update: Update
  list: List
  move: Move
}

const buildRegisterRoutes = (methods: GroupMethods, middlewares: Middlewares) => {
  const { createGroupRules, deleteGroupRules, deleteManyGroupRules, listGroupsRules, updateGroupRules, moveGroupsRules } =
    buildGroupRules(middlewares)
  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /group:
     *   post:
     *     tags: [Group]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/createGroup'
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                            $ref: '#/components/entities/Group'
     */
    namespace.post('/', createGroupRules, createRouteHandler(methods.create))

    namespace.delete('/', deleteManyGroupRules, createRouteHandler(methods.deleteMany))

    /**
     * @openapi
     * /group/{id}:
     *   delete:
     *     tags: [Group]
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
     *                  $ref: '#/components/entities/Group'
     */
    namespace.delete('/:id', deleteGroupRules, createRouteHandler(methods.delete))

    namespace.patch('/move', moveGroupsRules, createRouteHandler(methods.move))

    /**
     * @openapi
     * /group/{id}:
     *   patch:
     *     tags: [Group]
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
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/updateGroup'
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                            $ref: '#/components/entities/Group'
     */
    namespace.patch('/:id', updateGroupRules, createRouteHandler(methods.update))

    /**
     * @openapi
     * /group/list:
     *   get:
     *     tags: [Group]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: page
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
     *                            $ref: '#/components/entities/Group'
     *                        pages:
     *                          type: number
     */

    namespace.get('/list', listGroupsRules, createRouteHandler(methods.list))

    root.use('/group', namespace)
  }
}

export const buildGroupHandler = (params: Params): IHandler => {
  const create = buildCreateGroup(params)
  const del = buildDelete(params)
  const deleteMany = buildDeleteMany(params)
  const update = buildUpdate(params)
  const list = buildList(params)
  const move = buildMove(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        create,
        delete: del,
        deleteMany,
        update,
        list,
        move
      },
      params.middlewares
    )
  }
}
