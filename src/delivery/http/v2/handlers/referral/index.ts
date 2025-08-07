import { IHandler } from '../types'
import { buildCreate, Create } from './create'
import { buildDelete, Delete } from './delete'
import { buildList, List } from './list'
import { buildWithdraw, Withdraw } from './withdraw'
import Express from 'express'
import { createRouteHandler } from '../../routeHandler'
import { buildReferralRules } from './rules'
import { DeliveryParams } from '@/delivery/types'
import { Middlewares } from '../../middlewares'

type Params = Pick<DeliveryParams, 'referral' | 'middlewares'>

export type ReferralMethods = {
  create: Create
  delete: Delete
  list: List
  withdraw: Withdraw
}

const buildRegisterRoutes = (methods: ReferralMethods, middlewares: Middlewares) => {
  const { createRules, withdrawRules, listReferralRules, deleteReferralRules } =
    buildReferralRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()
    /**
     * @openapi
     * /referral:
     *   post:
     *     tags: [Referral]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/rules/createReferral'
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/Referral'
     */
    namespace.post('/', createRules, createRouteHandler(methods.create))

    /**
     * @openapi
     * /referral/{id}/withdraw:
     *   post:
     *     tags: [Referral]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/rules/withdrawReferral'
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
     *               properties:
     *                 id:
     *                   type: string
     *                 provider:
     *                   type: string
     *                 amount:
     *                   type: number
     *                 currency:
     *                   type: string
     *                 meta:
     *                   type: object
     *                 status:
     *                   type: string
     *                 type:
     *                   type: string
     *                 plan_id:
     *                   type: string
     *                 user_id:
     *                   type: string
     *                 referral_id:
     *                   type: string
     *                 created_at:
     *                   type: string
     *                 external_id:
     *                   type: string
     *                 enterprise_id:
     *                   type: string
     */
    namespace.post('/:id/withdraw', withdrawRules, createRouteHandler(methods.withdraw))
    /**
     * @openapi
     * /referral/list:
     *   get:
     *     tags: [Referral]
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
     *                 $ref: '#/components/entities/Referral'
     */
    namespace.get('/list', listReferralRules, createRouteHandler(methods.list))
    /**
     * @openapi
     * /referral/{id}:
     *   delete:
     *     tags: [Referral]
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
     *               $ref: '#/components/entities/Referral'
     */
    namespace.delete('/:id', deleteReferralRules, createRouteHandler(methods.delete))
    root.use('/referral', namespace)
  }
}

export const buildReferralHandler = (params: Params): IHandler => {
  const create = buildCreate(params)
  const d = buildDelete(params)
  const list = buildList(params)
  const withdraw = buildWithdraw(params)
  return {
    registerRoutes: buildRegisterRoutes(
      {
        create,
        delete: d,
        list,
        withdraw,
      },
      params.middlewares,
    ),
  }
}
